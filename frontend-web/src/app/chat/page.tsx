'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  FlagIcon,
  UserIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Chat {
  _id: string;
  participants: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      profilePicture?: { url: string };
    };
    role: string;
  }>;
  listing: {
    _id: string;
    title: string;
    images: Array<{ url: string; isPrimary: boolean }>;
    price: { amount: number; currency: string };
  };
  lastMessage?: {
    content: string;
    sender: string;
    sentAt: string;
    messageType: string;
  };
  unreadCount: Array<{
    user: string;
    count: number;
  }>;
  status: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
  };
  content: string;
  messageType: string;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { socket, joinChat, leaveChat, sendMessage: socketSendMessage } = useSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      joinChat(selectedChat._id);
      
      return () => {
        leaveChat(selectedChat._id);
      };
    }
  }, [selectedChat, joinChat, leaveChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/chat');
      setChats(response.data.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(`/chat/${chatId}`);
      setMessages(response.data.data.messages);
      
      // Mark messages as read
      await axios.put(`/chat/${chatId}/read`);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        messageType: 'text'
      };

      // Send via socket
      socketSendMessage(selectedChat._id, messageData);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.user._id !== user?.id);
  };

  const getUnreadCount = (chat: Chat) => {
    const unreadEntry = chat.unreadCount.find(u => u.user === user?.id);
    return unreadEntry ? unreadEntry.count : 0;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => router.back()} className="text-gray-700 hover:text-[#0A0F2C]">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-[#0A0F2C]">Messages</h1>
              <div></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {chats.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {chats.map((chat) => {
                        const otherParticipant = getOtherParticipant(chat);
                        const unreadCount = getUnreadCount(chat);
                        
                        return (
                          <button
                            key={chat._id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full p-4 text-left hover:bg-gray-50 ${
                              selectedChat?._id === chat._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                  {otherParticipant?.user.profilePicture ? (
                                    <img
                                      src={otherParticipant.user.profilePicture.url}
                                      alt={`${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(chat.updatedAt)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {chat.lastMessage?.content || 'No messages yet'}
                                </p>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-500">
                                    {chat.listing.title}
                                  </p>
                                  {unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                      <p className="text-gray-600 mb-4">Start a conversation by contacting a seller</p>
                      <Link
                        href="/listings"
                        className="bg-[#0A0F2C] text-white px-4 py-2 rounded-md hover:opacity-90"
                      >
                        Browse Listings
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              {selectedChat ? (
                <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {getOtherParticipant(selectedChat)?.user.profilePicture ? (
                          <img
                            src={getOtherParticipant(selectedChat)!.user.profilePicture!.url}
                            alt={`${getOtherParticipant(selectedChat)!.user.firstName} ${getOtherParticipant(selectedChat)!.user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {getOtherParticipant(selectedChat)?.user.firstName} {getOtherParticipant(selectedChat)?.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedChat.listing.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/listings/${selectedChat.listing._id}`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender._id === user?.id;
                      const isRead = message.readBy.some(r => r.user !== user?.id);
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {!isOwn && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                {message.sender.profilePicture ? (
                                  <img
                                    src={message.sender.profilePicture.url}
                                    alt={`${message.sender.firstName} ${message.sender.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            )}
                            
                            <div className={`px-4 py-2 rounded-lg ${
                              isOwn 
                                ? 'bg-[#0A0F2C] text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center justify-end mt-1 space-x-1 ${
                                isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <span className="text-xs">
                                  {formatTime(message.createdAt)}
                                </span>
                                {isOwn && (
                                  <CheckIcon className={`h-3 w-3 ${isRead ? 'text-blue-300' : ''}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={sendMessage} className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <PaperClipIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <PhotoIcon className="h-5 w-5" />
                      </button>
                      
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      />
                      
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2 bg-[#0A0F2C] text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      >
                        {sending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <PaperAirplaneIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
                  <div className="text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
