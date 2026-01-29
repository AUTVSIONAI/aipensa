import { QueryTypes } from "sequelize";
import sequelize from "./database";
import Whatsapp from "./models/Whatsapp";
import Queue from "./models/Queue";

async function checkQueue5() {
  try {
    // Check if Queue 5 exists
    const queue5 = await Queue.findByPk(5);
    console.log("Queue 5 exists:", !!queue5);
    if (queue5) {
      console.log("Queue 5 details:", queue5.toJSON());
    }

    // Check Whatsapp settings
    const whatsapps = await Whatsapp.findAll();
    for (const w of whatsapps) {
      console.log(
        `Whatsapp ${w.id} (${w.name}): timeSendQueue=${w.timeSendQueue}, sendIdQueue=${w.sendIdQueue}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkQueue5();
