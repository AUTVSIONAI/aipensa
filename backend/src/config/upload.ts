import path from "path";
import multer from "multer";
import fs from "fs";
import Whatsapp from "../models/Whatsapp";
import { isEmpty, isNil } from "lodash";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

const ALLOWED_TYPE_ARCH = [
  "announcements",
  "logo",
  "avatar",
  "audios",
  "documents",
  "images",
  "videos"
];

const BLOCKED_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".msi", ".com", ".scr",
  ".pif", ".vbs", ".vbe", ".js", ".wsh", ".wsf", ".ps1",
  ".dll", ".cpl", ".inf", ".hta", ".reg"
];

export default {
  directory: publicFolder,
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {
      let companyId;
      companyId = req.user?.companyId;
      const { typeArch, fileId } = req.body;

      // Validate typeArch against whitelist
      if (typeArch && !ALLOWED_TYPE_ARCH.includes(typeArch)) {
        return cb(new Error("Invalid file type category"), "");
      }

      // Validate fileId against path traversal
      if (fileId && (fileId.includes("..") || fileId.includes("/") || fileId.includes("\\"))) {
        return cb(new Error("Invalid file identifier"), "");
      }

      if (companyId === undefined && isNil(companyId) && isEmpty(companyId)) {
        const authHeader = req.headers.authorization;
        const [, token] = authHeader.split(" ");
        const whatsapp = await Whatsapp.findOne({ where: { token } });
        companyId = whatsapp.companyId;
      }
      let folder;

      if (typeArch && typeArch !== "announcements" && typeArch !== "logo") {
        folder = path.resolve(
          publicFolder,
          `company${companyId}`,
          typeArch,
          fileId ? fileId : ""
        );
      } else if (typeArch && typeArch === "announcements") {
        folder = path.resolve(publicFolder, typeArch);
      } else if (typeArch === "logo") {
        folder = path.resolve(publicFolder);
      } else {
        folder = path.resolve(publicFolder, `company${companyId}`);
      }

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        fs.chmodSync(folder, 0o750);
      }
      return cb(null, folder);
    },
    filename(req, file, cb) {
      // Block executable file extensions
      const ext = path.extname(file.originalname).toLowerCase();
      if (BLOCKED_EXTENSIONS.includes(ext)) {
        return cb(new Error("File type not allowed"), "");
      }

      const { typeArch } = req.body;

      const fileName =
        typeArch && typeArch !== "announcements" && typeArch !== "logo"
          ? file.originalname.replace("/", "-").replace(/ /g, "_")
          : new Date().getTime() +
            "_" +
            file.originalname.replace("/", "-").replace(/ /g, "_");
      return cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
    files: 5
  }
};
