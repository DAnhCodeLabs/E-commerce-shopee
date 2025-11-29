import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Sử dụng hook useAuth từ file AuthContext bạn đã gửi
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // 1. Khởi tạo kết nối Socket
      // Lưu ý: Cổng 5000 là cổng server backend của bạn
      const socketInstance = io("http://localhost:4000", {
        query: {
          userId: user._id || user.id, // Hỗ trợ cả _id (mongo) hoặc id (nếu có transform)
        },
      });

      setSocket(socketInstance);

      // 2. Lắng nghe danh sách Online
      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // 3. Cleanup
      return () => {
        socketInstance.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
