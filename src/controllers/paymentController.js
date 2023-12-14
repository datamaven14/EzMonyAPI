import stripe from "stripe";
import moment from "moment";
import { errorResponse, successResponse } from "../utils/responses.js";
import { surveyAttrs, dayRangeMultipliers } from "../utils/constants.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeInstance = stripe(stripeSecretKey);

export const makePayment = async (req, res) => {
  try {
    const { type, name, amount } = req.body;
    const product = await stripeInstance.products.create({
      name: `${type}: ${name}`,
      description: `Payment of your ${type}: "${name}" for promotion!`,
    });
    const price = await stripeInstance.prices.create({
      product: product.id,
      unit_amount: amount * 100,
      currency: "inr",
    });
    const session = await stripeInstance.checkout.sessions.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "https://ezmony.in/success",
      cancel_url: "https://ezmony.in/cancel",
    });
    successResponse(res, 200, "Payment initiated successfully", {
      sessionId: session.url,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

export const calculatePaymentForSurveys = async (req, res) => {
  try {
    const { noOfResponses, noOfQuestions } = req.body;
    const startDate = moment(req.body.startDate);
    const endDate = moment(req.body.endDate);
    const totalDays = moment.duration(endDate.diff(startDate)).asDays();
    const basePayment = surveyAttrs.costPerResponse * noOfResponses;
    const questionPayment = surveyAttrs.costPerQuestion * noOfQuestions;
    let multiplier = 0;
    for (const range in dayRangeMultipliers) {
      if (totalDays <= parseInt(range, 10)) {
        multiplier = dayRangeMultipliers[range];
        break;
      }
    }
    const payment = basePayment + (multiplier * basePayment);
    successResponse(res, 200, "Payment calculated successfully", {
      payout: Math.round(payment + questionPayment)
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};