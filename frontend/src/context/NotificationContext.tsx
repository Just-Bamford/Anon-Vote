import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type NotificationType =
  | "ballot_created"
  | "ballot_closed"
  | "results_published"
  | "token_requested"
  | "warning";

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "time" | "read">,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "anonvote-notifications";

const seedNotifications: Notification[] = [
  {
    id: 1,
    title: "New ballot created",
    message: "Ballot #1234 was created by your organization",
    time: "2m ago",
    read: false,
    type: "ballot_created",
  },
  {
    id: 2,
    title: "Results available",
    message: "Results for ballot #1233 are now ready to view",
    time: "1h ago",
    read: true,
    type: "results_published",
  },
  {
    id: 3,
    title: "System maintenance",
    message: "Scheduled maintenance in 24 hours",
    time: "3h ago",
    read: true,
    type: "warning",
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return seedNotifications;
      }
    }
    return seedNotifications;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "time" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: "Just now",
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
