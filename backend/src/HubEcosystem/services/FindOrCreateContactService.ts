import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";

interface HubContact {
  name: string;
  firstName: string;
  lastName: string;
  picture: string;
  from: string;
  connection: Whatsapp;
}

const FindOrCreateContactService = async (
  contact: HubContact
): Promise<Contact> => {
  const { name, picture, from, connection, firstName, lastName } = contact;

  const contactExists = await Contact.findOne({
    where: {
      number: from,
      companyId: connection.companyId
    }
  });

  if (contactExists) {
    return contactExists;
  }

  const newContact = await Contact.create({
    name: name || firstName || lastName,
    profilePicUrl: picture,
    channel: connection.channel,
    number: from,
    companyId: connection.companyId
  });

  return newContact;
};

export default FindOrCreateContactService;
