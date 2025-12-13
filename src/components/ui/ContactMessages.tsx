import React, { useState, useEffect } from "react";
import { Mail, Eye, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/contacts");
      setMessages(response.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load messages";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setDeleting(id);
      await axiosInstance.delete(`/contacts/${id}`);
      setMessages(messages.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) {
        setShowModal(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete message";
      alert(msg);
    } finally {
      setDeleting(null);
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
        <button
          onClick={fetchMessages}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <p className="font-semibold text-lg">Error Loading Messages</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={fetchMessages}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No contact messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-amber-500"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {message.subject}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    From: <span className="font-medium">{message.name}</span> (
                    {message.email})
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {formatDate(message.createdAt)}
                  </p>
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {message.message}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleViewMessage(message)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                    title="View full message"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    disabled={deleting === message.id}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing full message */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-amber-500 to-amber-600 text-white p-6 border-b">
              <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
              <p className="text-amber-100 mt-2">
                From: {selectedMessage.name} ({selectedMessage.email})
              </p>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                {formatDate(selectedMessage.createdAt)}
              </p>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            <div className="sticky bottom-0 bg-gray-100 p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  // Copy email to clipboard
                  navigator.clipboard.writeText(selectedMessage.email);
                  alert("Email copied!");
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                Copy Email
              </button>
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                disabled={deleting === selectedMessage.id}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
              >
                {deleting === selectedMessage.id ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
