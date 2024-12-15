import { NextApiRequest, NextApiResponse } from 'next'
import { sendChatMessage } from '../../utils/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { messages } = req.body
    const lastMessage = messages[messages.length - 1]

    if (lastMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' })
    }

    const response = await sendChatMessage(lastMessage.content)
    
    // Return the response in the format expected by the chat UI
    return res.status(200).json({
      id: Date.now().toString(),
      role: 'assistant',
      content: response
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

