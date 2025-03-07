import axios from "axios";
import emailjs from "@emailjs/browser";

const options = {
  publicKey: "cbbKuZ8g5MYb9dcw8",
  // Do not allow headless browsers
  blockHeadless: true,
  blockList: {
    // Block the suspended emails
    // list: ["foo@emailjs.com", "bar@emailjs.com"],
    // The variable contains the email address
    watchVariable: "userEmail",
  },
  limitRate: {
    // Set the limit rate for the application
    id: "app",
    // Allow 1 request per 10s
    throttle: 10000,
  },
};

const sendEmail = async (
  formData,
  companyEmail,
  isUsingCompanyEmail = true
) => {
  const emailCompany = isUsingCompanyEmail
    ? companyEmail
    : "ntf_elcor@gmail.com";

  console.log("!!!!!emailCompany", emailCompany);
  emailjs.init(options);
  const params = {
    from_name: "RentCarsAdmins",
    from_email: formData.email,
    to_email: emailCompany,
    title: formData.title,
    message: formData.message,
    emailCompany: emailCompany,
    reply_to: "ntf_elcor@gmail.com",
  };
  const serviceId = "service_4bzoyag";
  const templateId = "template_zh0emkx";
  try {
    const response = await emailjs.send(serviceId, templateId, params);
    console.log("Email sent successfully!", response);
    return response;
  } catch (error) {
    console.error("Failed to send email", error);
    throw error;
  }
};

export default sendEmail;
