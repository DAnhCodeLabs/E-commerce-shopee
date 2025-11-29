import React, { useState } from "react";
import SellerConversationList from "../components/SellerConversationList";
import SellerChatWindow from "../components/SellerChatWindow";

const SellerChatPage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div className="h-[calc(100vh-64px)] bg-white m-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
      <SellerConversationList
        onSelectChat={setSelectedCustomer}
        selectedChatId={selectedCustomer?._id}
      />
      <div className="flex-1 min-w-0 bg-gray-50 border-l border-gray-200">
        <SellerChatWindow customer={selectedCustomer} />
      </div>
    </div>
  );
};

export default SellerChatPage;
