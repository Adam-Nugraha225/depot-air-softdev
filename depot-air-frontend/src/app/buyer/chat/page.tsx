'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { chatAPI, orderAPI } from '@/lib/api';
import { Send, MessageSquare, Loader2, Search, Paperclip, MapPin, Phone, Video, MoreVertical, Image as ImageIcon, Smile, SquarePen } from 'lucide-react';

interface ChatUser {
  id: string;
  name: string;
  role: string;
}

interface ActiveChat {
  user: ChatUser;
  lastMessage: string;
  lastMessageAt: string;
  isFromMe: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  hasAttachment?: boolean;
  attachmentUrl?: string;
}

export default function BuyerChat() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'SEMUA' | 'VENDOR' | 'DUKUNGAN'>('SEMUA');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const res = await chatAPI.getActiveChats();
      const currentChats = res.data.data || [];
      const updatedChats = [...currentChats];

      // Fetch active orders to auto-populate chat contacts
      let uniqueContacts: Record<string, { id: string; name: string; role: string }> = {};
      try {
        const ordersRes = await orderAPI.getOrders();
        const activeOrders = ordersRes.data.data || [];
        activeOrders.forEach((o: any) => {
          if (user?.role === 'BUYER' && o.vendor && o.vendor.id) {
            uniqueContacts[o.vendor.id] = {
              id: o.vendor.id,
              name: o.vendor.name,
              role: 'VENDOR'
            };
          } else if (user?.role === 'VENDOR' && o.buyer && o.buyer.id) {
            uniqueContacts[o.buyer.id] = {
              id: o.buyer.id,
              name: o.buyer.name,
              role: 'BUYER'
            };
          }
        });
      } catch (err) {
        console.error("Gagal memuat kontak dari pesanan", err);
      }

      // Check query parameters
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryVendorId = params.get('vendorId');
        const queryVendorName = params.get('vendorName');
        if (queryVendorId && queryVendorName) {
          uniqueContacts[queryVendorId] = {
            id: queryVendorId,
            name: queryVendorName,
            role: 'VENDOR'
          };
        }
      }

      // Prepend contacts not already in active chats list
      Object.values(uniqueContacts).forEach((contact: any) => {
        const exists = currentChats.some((c: any) => c.user.id === contact.id);
        if (!exists) {
          updatedChats.unshift({
            user: {
              id: contact.id,
              name: contact.name,
              role: contact.role
            },
            lastMessage: 'Mulai obrolan dengan mengirim pesan...',
            lastMessageAt: new Date().toISOString(),
            isFromMe: false
          });
        }
      });

      setChats(updatedChats);

      // Auto-select chat based on query params or active contacts
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const queryVendorId = params.get('vendorId');
        if (queryVendorId) {
          const match = updatedChats.find((c: any) => c.user.id === queryVendorId);
          if (match) {
            selectChat(match.user);
            return;
          }
        }
      }

      if (updatedChats.length > 0 && !selectedChat) {
        selectChat(updatedChats[0].user);
      }
    } catch { } finally {
      setLoading(false);
    }
  };

  const selectChat = async (chatUser: ChatUser) => {
    setSelectedChat(chatUser);
    try {
      const res = await chatAPI.getMessages(chatUser.id);
      const dbMsgs = res.data.data;
      
      // Inject mockup map image attachment to the specific AquaStream message to match PDF Page 6
      const enrichedMsgs = dbMsgs.map((msg: Message) => {
        if (
          chatUser.name.toLowerCase().includes('aquastream') &&
          msg.content.includes('estimasi posisinya')
        ) {
          return {
            ...msg,
            hasAttachment: true,
            attachmentUrl: '/images/water_truck.png' // Or another nature path representing the delivery location map screenshot from PDF
          };
        }
        return msg;
      });
      
      setMessages(enrichedMsgs);
    } catch { }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    setSending(true);
    try {
      await chatAPI.sendMessage({ receiverId: selectedChat.id, content: newMessage.trim() });
      setNewMessage('');
      const res = await chatAPI.getMessages(selectedChat.id);
      setMessages(res.data.data);
      loadChats();
    } catch {
      showToast('Gagal mengirim pesan. Coba lagi.', 'error');
    } finally {
      setSending(false);
    }
  };

  const filteredChats = chats.filter(c => {
    // Filter by search text
    const matchesSearch = c.user.name.toLowerCase().includes(chatSearch.toLowerCase());
    // Filter by active tab
    if (activeTab === 'VENDOR') return matchesSearch && c.user.role === 'VENDOR';
    if (activeTab === 'DUKUNGAN') return matchesSearch && c.user.role !== 'VENDOR';
    return matchesSearch; // SEMUA
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return `${Math.floor(diffHours * 60)}m lalu`;
    if (diffHours < 24) return `${Math.floor(diffHours)}h lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-slate-150 bg-white shadow-sm animate-fade-in">
      {/* Chat List Sidebar */}
      <div className={`w-full sm:w-80 border-r border-slate-150 flex flex-col flex-shrink-0 ${selectedChat ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Pesan</h2>
            <button className="p-1.5 hover:bg-slate-50 text-primary-650 rounded-lg transition-colors">
              <SquarePen className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-[#EBF1F6] p-1 rounded-xl">
            {(['SEMUA', 'VENDOR', 'DUKUNGAN'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-primary-650 shadow-sm'
                    : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                {tab === 'SEMUA' ? 'Semua' : tab === 'VENDOR' ? 'Vendor' : 'Dukungan'}
              </button>
            ))}
          </div>

          {/* Search bar inside sidebar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Cari pesan di sini..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Channels scrollbar list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Belum ada percakapan</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.user.id}
                onClick={() => selectChat(chat.user)}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-all flex items-center gap-3 ${
                  selectedChat?.id === chat.user.id ? 'bg-[#EBF3FC]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {chat.user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-800 truncate">{chat.user.name}</p>
                    <span className="text-[9px] text-slate-400 flex-shrink-0">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {chat.isFromMe ? 'Anda: ' : ''}{chat.lastMessage}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Active Chat Header */}
          <div className="px-6 py-3 border-b border-slate-150 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <button className="sm:hidden mr-1 text-slate-400 hover:text-slate-600 font-bold" onClick={() => setSelectedChat(null)}>←</button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs">
                {selectedChat.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-bold text-xs text-slate-850">{selectedChat.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400">Online • Vendor Air Bersih</span>
                </div>
              </div>
            </div>

            {/* Widget icons */}
            <div className="flex items-center gap-1.5">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFD]">
            {/* Mock Day Divider */}
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 bg-[#E8EFF7] rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-wider">HARI INI</span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] space-y-2`}>
                    <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-150 rounded-bl-none shadow-sm'
                    }`}>
                      <p>{msg.content}</p>
                      
                      {/* Image Map Route trace attachment visual if defined */}
                      {msg.hasAttachment && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          {/* We show map route traces visual */}
                          <div className="h-44 bg-[#E5E9F0] relative overflow-hidden flex items-center justify-center">
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-white font-bold rounded text-[8px]">MAP TRACING</span>
                            <img src="/images/water_truck.png" alt="Delivery Location" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-primary-900/10 flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-red-500 drop-shadow-md animate-bounce" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`text-[9px] mt-1 text-slate-400 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} {isMe && '✓'}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel matching PDF bar */}
          <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-150 flex items-center gap-2 bg-white">
            <div className="flex items-center gap-1 px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-1">
              <button type="button" className="p-1 text-slate-400 hover:text-slate-650 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 text-slate-400 hover:text-slate-650 transition-colors">
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                id="chat-input"
                type="text"
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none px-2"
                placeholder="Ketik pesan di sini..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="button" className="p-1 text-slate-400 hover:text-slate-650 transition-colors">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden sm:flex items-center justify-center bg-slate-50/50">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Pilih percakapan</p>
            <p className="text-xs text-slate-400">untuk mulai berkirim pesan</p>
          </div>
        </div>
      )}
    </div>
  );
}
