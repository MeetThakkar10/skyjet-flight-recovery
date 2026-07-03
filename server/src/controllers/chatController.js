import { sendMessage, getChatHistory } from "../services/chatService.js";

export async function sendMessageController(req, res, next) {
  try {
    const reply = await sendMessage(req.params.bookingId, req.body.message);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

export async function getChatHistoryController(req, res, next) {
  try {
    const messages = await getChatHistory(req.params.bookingId);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}
