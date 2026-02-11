import AgentTask from "../models/AgentTask";
import * as SocialMediaService from "../services/FacebookServices/SocialMediaService";
import User from "../models/User";
import Company from "../models/Company";
import Plan from "../models/Plan";
import { getWbot } from "../libs/wbot";

export default {
  key: "AgentExecutionQueue",
  async handle({ data }: { data: { taskId: string } }) {
    const { taskId } = data;

    console.log(`[AgentWorker] Processing task ${taskId}`);

    const task = await AgentTask.findByPk(taskId, {
      include: [
        {
          model: User,
          include: [{ model: Company, include: [{ model: Plan, as: "plan" }] }]
        }
      ]
    });

    if (!task) {
      console.error(`[AgentWorker] Task ${taskId} not found`);
      return;
    }

    if (task.status !== "pending") {
      console.log(`[AgentWorker] Task ${taskId} status is ${task.status}, skipping.`);
      return;
    }

    await task.update({ status: "running" });

    try {
      const companyId = task.user?.companyId || task.payload.companyId;
      
      // Get FB Config for this company
      // Note: This gets the default config. If the task specifies a page, we might need logic to find that specific page's token.
      // For now, assuming single connection or default is fine.
      const { accessToken, adAccountId } = await SocialMediaService.getFbConfig(companyId);

      let result;

      switch (task.type) {
        case "instagram_post": {
          if (!accessToken) {
            throw new Error("No Facebook access token found for this company.");
          }
          const { media_type, caption, image_url, video_url } = task.payload;
          
          // We need an Instagram ID. 
          // If not provided in payload, we need to fetch it or guess it.
          // For now, let's assume the user has configured one.
          // Since getFbConfig returns businessId/adAccountId but NOT instagramId directly, 
          // we might need to fetch pages to find the connected Instagram.
          // However, SocialMediaService.publishToInstagram REQUIRES instagramId.
          
          // IMPROVEMENT: Fetch connected pages to find the first Instagram ID if not in payload.
          // Or assume payload HAS instagramId (which the Agent should have asked for or deduced).
          
          let instagramId = task.payload.instagram_id;
          
          if (!instagramId) {
             // Try to find one from the database (Whatsapp table)
             // This logic mimics what `MarketingController` might do or what the user expects.
             // Ideally, the Agent Plan should have resolved this.
             // But let's try to be robust.
             const pages = await SocialMediaService.getFbConfig(companyId); 
             // getFbConfig doesn't return pages. It returns token.
             // We can use the token to fetch pages.
             // Or query the Whatsapp table directly like getFbConfig does.
          }
          
          if (!instagramId) {
             throw new Error("Instagram ID not provided and could not be resolved.");
          }

          if (media_type === "VIDEO") {
            result = await SocialMediaService.publishVideoToInstagram(
              companyId,
              instagramId,
              video_url,
              caption
            );
          } else {
             result = await SocialMediaService.publishToInstagram(
               companyId,
               instagramId,
               image_url,
               caption
             );
          }
          break;
        }

        case "ads_campaign": {
           if (!accessToken) {
             throw new Error("No Facebook access token found for this company.");
           }
           if (!adAccountId) {
             throw new Error("No Ad Account ID found for this company.");
           }

           // Use the full campaign creation logic
           result = await SocialMediaService.createFullAdCampaign(companyId, task.payload);
           break;
        }

        case "whatsapp_status": {
          const { media_type, caption, image_url, video_url, whatsappId } = task.payload;

          if (!whatsappId) {
            throw new Error("Whatsapp ID missing in task payload");
          }

          const wbot = getWbot(whatsappId);
          const statusJid = "status@broadcast";

          if (media_type === "VIDEO") {
            if (!video_url) throw new Error("Video URL missing");
            await wbot.sendMessage(statusJid, { video: { url: video_url }, caption });
          } else {
            if (!image_url) throw new Error("Image URL missing");
            await wbot.sendMessage(statusJid, { image: { url: image_url }, caption });
          }
          
          result = { success: true, type: "whatsapp_status", postedAt: new Date() };
          break;
        }

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      await task.update({ status: "completed", result });
      console.log(`[AgentWorker] Task ${taskId} completed successfully.`);

    } catch (error: any) {
      console.error(`[AgentWorker] Task ${taskId} failed:`, error);
      await task.update({ 
        status: "failed", 
        result: { error: error.message || "Unknown error" } 
      });
    }
  }
};
