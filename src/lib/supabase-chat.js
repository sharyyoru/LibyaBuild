import { supabase } from './supabase'

/**
 * Send a message between two users
 */
export const sendChatMessage = async (senderId, receiverId, message) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error sending message:', error)
    return { data: null, error }
  }
}

/**
 * Get messages between two users
 */
export const getChatMessages = async (userId1, userId2) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { data: [], error }
  }
}

/**
 * Subscribe to new messages between two users
 */
export const subscribeToChatMessages = (userId1, userId2, callback) => {
  const subscription = supabase
    .channel('chat_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `sender_id=eq.${userId1},receiver_id=eq.${userId2}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `sender_id=eq.${userId2},receiver_id=eq.${userId1}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return subscription
}
