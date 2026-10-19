"use client";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  Image as ImageIcon,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Smile,
  UserPlus,
  X,
} from "lucide-react";

import {
  getCurrentUser,
  getMessages,
  markMessageRead,
  searchUsers,
  sendImageMessage,
  sendMessage,
} from "../lib/api";

import type {
  Message,
  User,
  UserSearchResult,
} from "../lib/api";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";

import { useSearchParams } from "next/navigation";

import styles from "./Messages.module.css";


// ============================================================
// TYPES
// ============================================================

type Conversation = {
  user: UserSearchResult;

  messages: Message[];

  lastMessage: Message | null;

  unread: number;
};


// ============================================================
// HELPERS
// ============================================================

function getInitials(
  name: string
): string {
  const cleanName =
    name.trim();

  if (!cleanName) {
    return "?";
  }

  const parts =
    cleanName.split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}


function formatMessageTime(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


function formatConversationTime(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const diff =
    now.getTime() -
    date.getTime();

  const minute =
    60 * 1000;

  const hour =
    60 * minute;

  const day =
    24 * hour;

  if (diff < minute) {
    return "now";
  }

  if (diff < hour) {
    return `${Math.floor(
      diff / minute
    )}m`;
  }

  if (diff < day) {
    return `${Math.floor(
      diff / hour
    )}h`;
  }

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return formatMessageTime(
      value
    );
  }

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    }
  );
}


function getMessagePreview(
  message: Message | null
): string {
  if (!message) {
    return "Start a conversation";
  }

  if (
    message.text?.trim()
  ) {
    return message.text;
  }

  if (
    message.image_url
  ) {
    return "📷 Image";
  }

  return "Message";
}


// ============================================================
// PAGE
// ============================================================

export default function MessagesPage() {

  const searchParams =
    useSearchParams();

  const initialUserId =
    searchParams.get(
      "userId"
    );

  const requestedUserId =
    initialUserId
      ? Number(initialUserId)
      : null;


  // ----------------------------------------------------------
  // USER
  // ----------------------------------------------------------

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<User | null>(null);


  // ----------------------------------------------------------
  // CONVERSATIONS
  // ----------------------------------------------------------

  const [
    conversations,
    setConversations,
  ] =
    useState<Conversation[]>(
      []
    );


  // ----------------------------------------------------------
  // ACTIVE USER
  // ----------------------------------------------------------

  const [
    activeUser,
    setActiveUser,
  ] =
    useState<UserSearchResult | null>(
      null
    );


  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    searchResults,
    setSearchResults,
  ] =
    useState<UserSearchResult[]>(
      []
    );


  const [
    searchingUsers,
    setSearchingUsers,
  ] =
    useState(false);


  const [
    showUserSearch,
    setShowUserSearch,
  ] =
    useState(false);


  // ----------------------------------------------------------
  // MESSAGE
  // ----------------------------------------------------------

  const [
    message,
    setMessage,
  ] =
    useState("");


  // ----------------------------------------------------------
  // IMAGE
  // ----------------------------------------------------------

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<File | null>(
      null
    );


  const [
    imagePreview,
    setImagePreview,
  ] =
    useState<string | null>(
      null
    );


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  const [
    mobileChat,
    setMobileChat,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    sending,
    setSending,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const messagesAreaRef =
    useRef<HTMLDivElement | null>(
      null
    );


  // ==========================================================
  // FIND CONVERSATION
  // ==========================================================

  const activeConversation =
    useMemo(() => {

      if (!activeUser) {
        return null;
      }

      return (
        conversations.find(
          (conversation) =>
            conversation.user.id ===
            activeUser.id
        ) || null
      );

    }, [
      conversations,
      activeUser,
    ]);


  const activeMessages =
    activeConversation?.messages ||
    [];


  // ==========================================================
  // LOAD INITIAL DATA
  // ==========================================================

  useEffect(() => {

    let mounted = true;


    async function loadMessages() {

      try {

        setLoading(true);

        setError("");


        const [
          user,
          allMessages,
        ] =
          await Promise.all([
            getCurrentUser(),
            getMessages(),
          ]);


        if (!mounted) {
          return;
        }


        setCurrentUser(
          user
        );


        /*
         * We need user information to turn
         * sender/receiver IDs into real
         * conversation names and avatars.
         *
         * Search endpoint is used separately
         * when the user searches.
         */

        await buildConversations(
          user,
          allMessages
        );

      } catch (err) {

        console.error(
          "Messages loading error:",
          err
        );


        if (mounted) {

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load messages."
          );

        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    async function buildConversations(
      user: User,
      allMessages: Message[]
    ) {

      /*
       * Collect all user IDs involved
       * in the current user's messages.
       */
      const userIds =
        Array.from(
          new Set(
            allMessages
              .map(
                (item) =>
                  item.sender_id ===
                  user.id
                    ? item.receiver_id
                    : item.sender_id
              )
          )
        );


      const foundUsers:
        UserSearchResult[] = [];


      /*
       * We use the search endpoint with
       * the exact user ID's handle/name
       * when available.
       *
       * If no conversation exists yet,
       * no conversation card is created.
       */

      for (
        const userId of userIds
      ) {

        try {

          /*
           * Existing backend has /users/{id}.
           * Importing getUser would be another
           * dependency, so fetch directly through
           * search is avoided here.
           *
           * Instead we use the existing
           * authenticated user list endpoint
           * through the browser fetch.
           */
          const token =
            typeof window !==
            "undefined"
              ? localStorage.getItem(
                  "mechabook-token"
                )
              : null;


          const response =
            await fetch(
              `http://127.0.0.1:8000/users/${userId}`,
              {
                headers: token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {},
              }
            );


          if (!response.ok) {
            continue;
          }


          const otherUser =
            await response.json();


          foundUsers.push({
            id: otherUser.id,
            name: otherUser.name,
            handle: otherUser.handle,
            avatar:
              otherUser.avatar ||
              null,
          });

        } catch {
          // Ignore individual user lookup failures.
        }

      }


      const grouped =
        foundUsers.map(
          (otherUser) => {

            const messages =
              allMessages
                .filter(
                  (item) =>
                    (
                      item.sender_id ===
                        user.id &&
                      item.receiver_id ===
                        otherUser.id
                    ) ||
                    (
                      item.sender_id ===
                        otherUser.id &&
                      item.receiver_id ===
                        user.id
                    )
                )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    new Date(
                      a.created_at ||
                        0
                    ).getTime() -
                    new Date(
                      b.created_at ||
                        0
                    ).getTime()
                );


            const unread =
              messages.filter(
                (item) =>
                  item.receiver_id ===
                    user.id &&
                  !item.read
              ).length;


            return {
              user: otherUser,

              messages,

              lastMessage:
                messages[
                  messages.length - 1
                ] || null,

              unread,
            };

          }
        );


      if (!mounted) {
        return;
      }


      setConversations(
        grouped
      );


      /*
       * If marketplace opened Messages with
       * ?userId=123, find that user and open
       * the conversation.
       */
      if (
        requestedUserId &&
        requestedUserId !==
          user.id
      ) {

        const existing =
          grouped.find(
            (conversation) =>
              conversation.user.id ===
              requestedUserId
          );


        if (existing) {

          setActiveUser(
            existing.user
          );

          setMobileChat(
            true
          );

        } else {

          /*
           * No existing conversation.
           * Search the user by ID isn't
           * available, so try all users
           * from the normal users endpoint.
           */
          try {

            const token =
              localStorage.getItem(
                "mechabook-token"
              );


            const response =
              await fetch(
                `http://127.0.0.1:8000/users/${requestedUserId}`,
                {
                  headers: token
                    ? {
                        Authorization:
                          `Bearer ${token}`,
                      }
                    : {},
                }
              );


            if (response.ok) {

              const otherUser =
                await response.json();


              const newUser: UserSearchResult =
                {
                  id: otherUser.id,
                  name: otherUser.name,
                  handle:
                    otherUser.handle,
                  avatar:
                    otherUser.avatar ||
                    null,
                };


              setActiveUser(
                newUser
              );

              setMobileChat(
                true
              );

            }

          } catch {
            // Ignore invalid marketplace user.
          }

        }

      } else if (
        grouped.length > 0 &&
        !activeUser
      ) {

        setActiveUser(
          grouped[0].user
        );

      }

    }


    loadMessages();


    return () => {
      mounted = false;
    };

  }, [
    requestedUserId,
  ]);


  // ==========================================================
  // SEARCH USERS
  // ==========================================================

  useEffect(() => {

    if (!showUserSearch) {
      return;
    }


    const query =
      search.trim();


    if (!query) {

      setSearchResults([]);

      return;

    }


    let cancelled =
      false;


    const timer =
      window.setTimeout(
        async () => {

          try {

            setSearchingUsers(
              true
            );


            const results =
              await searchUsers(
                query
              );


            if (!cancelled) {

              setSearchResults(
                Array.isArray(
                  results
                )
                  ? results
                  : []
              );

            }

          } catch (err) {

            console.error(
              "User search error:",
              err
            );


            if (!cancelled) {

              setSearchResults(
                []
              );

            }

          } finally {

            if (!cancelled) {

              setSearchingUsers(
                false
              );

            }

          }

        },
        300
      );


    return () => {

      cancelled = true;

      window.clearTimeout(
        timer
      );

    };

  }, [
    search,
    showUserSearch,
  ]);


  // ==========================================================
  // SCROLL TO BOTTOM
  // ==========================================================

  useEffect(() => {

    const element =
      messagesAreaRef.current;


    if (!element) {
      return;
    }


    element.scrollTop =
      element.scrollHeight;

  }, [
    activeMessages.length,
    activeUser?.id,
  ]);


  // ==========================================================
  // SELECT CONVERSATION
  // ==========================================================

  async function selectConversation(
    user: UserSearchResult
  ) {

    setActiveUser(
      user
    );

    setMobileChat(
      true
    );

    setShowUserSearch(
      false
    );

    setSearch("");

    setSearchResults([]);

    setError("");


    try {

      const messages =
        await getMessages(
          user.id
        );


      setConversations(
        (previous: Conversation[]) => {

          const exists =
            previous.some(
              (item) =>
                item.user.id ===
                user.id
            );


          if (!exists) {

            return [
              ...previous,
              {
                user,

                messages,

                lastMessage:
                  messages[
                    messages.length - 1
                  ] || null,

                unread:
                  messages.filter(
                    (item) =>
                      item.receiver_id ===
                        currentUser?.id &&
                      !item.read
                  ).length,
              },
            ];

          }


          return previous.map(
            (conversation) =>
              conversation.user.id ===
              user.id
                ? {
                    ...conversation,

                    messages,

                    lastMessage:
                      messages[
                        messages.length - 1
                      ] || null,

                    unread:
                      messages.filter(
                        (item) =>
                          item.receiver_id ===
                            currentUser?.id &&
                          !item.read
                      ).length,
                  }
                : conversation
          );

        }
      );


      /*
       * Mark received unread messages as read.
       */
      for (
        const item of messages
      ) {

        if (
          currentUser &&
          item.receiver_id ===
            currentUser.id &&
          !item.read
        ) {

          try {

            await markMessageRead(
              item.id
            );

          } catch {
            // Do not break the chat if read status fails.
          }

        }

      }


      /*
       * Refresh local read state.
       */
      setConversations(
        (previous) =>
          previous.map(
            (conversation) =>
              conversation.user.id ===
              user.id
                ? {
                    ...conversation,

                    messages:
                      conversation.messages.map(
                        (item) =>
                          item.receiver_id ===
                            currentUser?.id
                            ? {
                                ...item,
                                read: true,
                              }
                            : item
                      ),

                    unread: 0,
                  }
                : conversation
          )
      );

    } catch (err) {

      console.error(
        "Conversation loading error:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Failed to load conversation."
      );

    }

  }


  // ==========================================================
  // REFRESH ACTIVE CHAT
  // ==========================================================

  async function refreshActiveConversation() {

    if (!activeUser) {
      return;
    }


    try {

      setRefreshing(
        true
      );


      const messages =
        await getMessages(
          activeUser.id
        );


      setConversations(
        (previous) =>
          previous.map(
            (conversation) =>
              conversation.user.id ===
              activeUser.id
                ? {
                    ...conversation,

                    messages,

                    lastMessage:
                      messages[
                        messages.length - 1
                      ] || null,

                    unread:
                      messages.filter(
                        (item) =>
                          item.receiver_id ===
                            currentUser?.id &&
                          !item.read
                      ).length,
                  }
                : conversation
          )
      );

    } catch (err) {

      console.error(
        "Conversation refresh error:",
        err
      );

    } finally {

      setRefreshing(
        false
      );

    }

  }


// ==========================================================
// REAL-TIME MESSAGE POLLING
// ==========================================================
// Check the active conversation every 2 seconds so messages
// from another browser/device appear without page reload.
// ==========================================================

useEffect(() => {
  if (!activeUser) {
    return;
  }

  // Create a stable non-null reference.
  const selectedUser = activeUser;
  const selectedUserId = selectedUser.id;

  let cancelled = false;

  async function pollActiveConversation() {
    try {
      const latestMessages =
        await getMessages(selectedUserId);

      if (cancelled) {
        return;
      }

      setConversations((previous) => {
        const exists = previous.some(
          (conversation) =>
            conversation.user.id === selectedUserId
        );

        // ------------------------------------------------------
        // BRAND NEW CONVERSATION
        // ------------------------------------------------------

        if (!exists) {
          return [
            ...previous,
            {
              user: selectedUser,
              messages: latestMessages,
              lastMessage:
                latestMessages[
                  latestMessages.length - 1
                ] || null,
              unread: 0,
            },
          ];
        }

        // ------------------------------------------------------
        // EXISTING CONVERSATION
        // ------------------------------------------------------

        return previous.map((conversation) => {
          if (
            conversation.user.id !==
            selectedUserId
          ) {
            return conversation;
          }

          return {
            ...conversation,
            messages: latestMessages,
            lastMessage:
              latestMessages[
                latestMessages.length - 1
              ] || null,
            unread: 0,
          };
        });
      });

      // --------------------------------------------------------
      // MARK RECEIVED MESSAGES AS READ
      // --------------------------------------------------------

      if (currentUser) {
        const unreadMessages =
          latestMessages.filter(
            (item) =>
              item.receiver_id ===
                currentUser.id &&
              !item.read
          );

        for (const item of unreadMessages) {
          try {
            await markMessageRead(item.id);
          } catch {
            // Ignore read-status errors.
          }
        }
      }
    } catch (err) {
      console.error(
        "Message polling error:",
        err
      );
    }
  }

  // Run immediately.
  pollActiveConversation();

  // Then check every 2 seconds.
  const interval =
    window.setInterval(
      pollActiveConversation,
      2000
    );

  return () => {
    cancelled = true;
    window.clearInterval(interval);
  };
}, [
  activeUser,
  currentUser,
]);


  // ==========================================================
  // IMAGE SELECT
  // ==========================================================

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      setError(
        "Only JPG, PNG, WEBP and GIF images are supported."
      );


      event.target.value =
        "";

      return;

    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "Image size cannot exceed 10 MB."
      );


      event.target.value =
        "";

      return;

    }


    setError("");


    if (imagePreview) {

      URL.revokeObjectURL(
        imagePreview
      );

    }


    const preview =
      URL.createObjectURL(
        file
      );


    setSelectedImage(
      file
    );

    setImagePreview(
      preview
    );


    event.target.value =
      "";

  }


  // ==========================================================
  // REMOVE SELECTED IMAGE
  // ==========================================================

  function removeSelectedImage() {

    if (imagePreview) {

      URL.revokeObjectURL(
        imagePreview
      );

    }


    setSelectedImage(
      null
    );

    setImagePreview(
      null
    );

  }


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  async function handleSendMessage() {
    if (!activeUser || sending) {
      return;
    }

    const cleanText = message.trim();

    if (!cleanText && !selectedImage) {
      return;
    }

    try {
      setSending(true);
      setError("");

      let newMessage: Message;

      if (selectedImage) {
        newMessage = await sendImageMessage(
          activeUser.id,
          selectedImage,
          cleanText || undefined
        );
      } else {
        newMessage = await sendMessage({
          receiver_id: activeUser.id,
          text: cleanText,
        });
      }

      // Immediately show the newly created message locally.
      setConversations((previous: Conversation[]) => {
        const exists = previous.some(
          (conversation) =>
            conversation.user.id === activeUser.id
        );

        if (!exists) {
          return [
            ...previous,
            {
              user: activeUser,
              messages: [newMessage],
              lastMessage: newMessage,
              unread: 0,
            },
          ];
        }

        return previous.map((conversation: Conversation) => {
          if (conversation.user.id !== activeUser.id) {
            return conversation;
          }

          const alreadyExists =
            conversation.messages.some(
              (item) => item.id === newMessage.id
            );

          if (alreadyExists) {
            return conversation;
          }

          return {
            ...conversation,
            messages: [
              ...conversation.messages,
              newMessage,
            ],
            lastMessage: newMessage,
            unread: 0,
          };
        });
      });

      setMessage("");
      removeSelectedImage();
    } catch (err) {
      console.error("Send message error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  }

  // FORM SUBMIT
  // ==========================================================

  function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    handleSendMessage();

  }


  // ==========================================================
  // ENTER KEY
  // ==========================================================

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSendMessage();

    }

  }


  // ==========================================================
  // NEW MESSAGE
  // ==========================================================

  function openNewMessage() {

    setShowUserSearch(
      true
    );

    setSearch("");

    setSearchResults([]);

    setMobileChat(
      false
    );

  }


  // ==========================================================
  // CLOSE SEARCH
  // ==========================================================

  function closeUserSearch() {

    setShowUserSearch(
      false
    );

    setSearch("");

    setSearchResults([]);

  }


  // ==========================================================
  // FILTERED CONVERSATIONS
  // ==========================================================

  const filteredConversations =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (
        !query ||
        showUserSearch
      ) {

        return conversations;

      }


      return conversations.filter(
        (conversation) =>
          conversation.user.name
            .toLowerCase()
            .includes(query) ||
          conversation.user.handle
            .toLowerCase()
            .includes(query) ||
          getMessagePreview(
            conversation.lastMessage
          )
            .toLowerCase()
            .includes(query)
      );

    }, [
      conversations,
      search,
      showUserSearch,
    ]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div
        className={
          styles.loadingState
        }
      >
        <div
          className={
            styles.loadingSpinner
          }
        />

        <p>
          Loading messages...
        </p>
      </div>
    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={
        styles.page
      }
    >

      <div
        className={
          styles.messagingShell
        }
      >

        {/* ================================================== */}
        {/* CONVERSATION SIDEBAR */}
        {/* ================================================== */}

        <aside
          className={`${styles.sidebar} ${
            mobileChat
              ? styles.hideOnMobile
              : ""
          }`}
        >

          {/* HEADER */}

          <div
            className={
              styles.sidebarHeader
            }
          >

            <div>

              <h1>
                Messages
              </h1>

              <p>
                Your conversations
              </p>

            </div>


            <button
              type="button"
              className={
                styles.newMessageButton
              }
              onClick={
                openNewMessage
              }
              aria-label="New message"
            >
              <UserPlus
                size={17}
              />
            </button>

          </div>


          {/* SEARCH */}

          <div
            className={
              styles.search
            }
          >

            <Search
              size={16}
            />

            <input
              type="text"
              placeholder={
                showUserSearch
                  ? "Search people..."
                  : "Search messages..."
              }
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
            />


            {showUserSearch && (

              <button
                type="button"
                className={
                  styles.searchClose
                }
                onClick={
                  closeUserSearch
                }
                aria-label="Close search"
              >
                <X
                  size={15}
                />
              </button>

            )}

          </div>


          {/* ================================================= */}
          {/* USER SEARCH RESULTS */}
          {/* ================================================= */}

          {showUserSearch && (

            <div
              className={
                styles.userSearchResults
              }
            >

              {searchingUsers && (

                <div
                  className={
                    styles.searchStatus
                  }
                >
                  Searching...
                </div>

              )}


              {!searchingUsers &&
                search.trim() &&
                searchResults.length ===
                  0 && (

                <div
                  className={
                    styles.searchStatus
                  }
                >
                  No users found.
                </div>

              )}


              {!search.trim() && (

                <div
                  className={
                    styles.searchStatus
                  }
                >
                  Search by name or username.
                </div>

              )}


              {searchResults.map(
                (user) => (

                  <button
                    key={
                      user.id
                    }
                    type="button"
                    className={
                      styles.userSearchItem
                    }
                    onClick={() =>
                      selectConversation(
                        user
                      )
                    }
                  >

                    <div
                      className={
                        styles.avatarWrap
                      }
                    >

                      {user.avatar ? (

                        <img
                          src={
                            user.avatar
                          }
                          alt={
                            user.name
                          }
                          className={
                            styles.avatarImage
                          }
                        />

                      ) : (

                        <div
                          className={
                            styles.avatar
                          }
                        >
                          {getInitials(
                            user.name
                          )}
                        </div>

                      )}

                    </div>


                    <div
                      className={
                        styles.userSearchInfo
                      }
                    >

                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        @{user.handle.replace(
                          /^@/,
                          ""
                        )}
                      </span>

                    </div>

                  </button>

                )
              )}

            </div>

          )}


          {/* ================================================= */}
          {/* CONVERSATION LIST */}
          {/* ================================================= */}

          {!showUserSearch && (

            <div
              className={
                styles.conversationList
              }
            >

              {filteredConversations.length ===
              0 ? (

                <div
                  className={
                    styles.emptyConversations
                  }
                >

                  <Search
                    size={25}
                  />

                  <p>
                    No conversations yet.
                  </p>

                  <button
                    type="button"
                    onClick={
                      openNewMessage
                    }
                  >
                    Start a conversation
                  </button>

                </div>

              ) : (

                filteredConversations.map(
                  (
                    conversation
                  ) => {

                    const user =
                      conversation.user;


                    return (
                      <button
                        key={
                          user.id
                        }
                        type="button"
                        className={`${styles.conversation} ${
                          activeUser?.id ===
                          user.id
                            ? styles.activeConversation
                            : ""
                        }`}
                        onClick={() =>
                          selectConversation(
                            user
                          )
                        }
                      >

                        <div
                          className={
                            styles.avatarWrap
                          }
                        >

                          {user.avatar ? (

                            <img
                              src={
                                user.avatar
                              }
                              alt={
                                user.name
                              }
                              className={
                                styles.avatarImage
                              }
                            />

                          ) : (

                            <div
                              className={
                                styles.avatar
                              }
                            >
                              {getInitials(
                                user.name
                              )}
                            </div>

                          )}

                        </div>


                        <div
                          className={
                            styles.conversationContent
                          }
                        >

                          <div
                            className={
                              styles.conversationTop
                            }
                          >

                            <strong>
                              {user.name}
                            </strong>

                            <span>
                              {
                                formatConversationTime(
                                  conversation
                                    .lastMessage
                                    ?.created_at
                                )
                              }
                            </span>

                          </div>


                          <div
                            className={
                              styles.conversationBottom
                            }
                          >

                            <p>
                              {
                                getMessagePreview(
                                  conversation.lastMessage
                                )
                              }
                            </p>


                            {conversation.unread >
                              0 && (

                              <span
                                className={
                                  styles.unread
                                }
                              >
                                {
                                  conversation.unread
                                }
                              </span>

                            )}

                          </div>

                        </div>

                      </button>
                    );

                  }
                )

              )}

            </div>

          )}

        </aside>


        {/* ================================================== */}
        {/* CHAT */}
        {/* ================================================== */}

        <section
          className={`${styles.chat} ${
            !mobileChat
              ? styles.chatMobileHidden
              : ""
          }`}
        >

          {activeUser ? (

            <>

              {/* CHAT HEADER */}

              <header
                className={
                  styles.chatHeader
                }
              >

                <button
                  type="button"
                  className={
                    styles.mobileBack
                  }
                  onClick={() =>
                    setMobileChat(
                      false
                    )
                  }
                  aria-label="Back"
                >
                  <ArrowLeft
                    size={19}
                  />
                </button>


                <div
                  className={
                    styles.chatUserAvatarWrap
                  }
                >

                  {activeUser.avatar ? (

                    <img
                      src={
                        activeUser.avatar
                      }
                      alt={
                        activeUser.name
                      }
                      className={
                        styles.chatAvatarImage
                      }
                    />

                  ) : (

                    <div
                      className={
                        styles.chatUserAvatar
                      }
                    >
                      {getInitials(
                        activeUser.name
                      )}
                    </div>

                  )}

                </div>


                <div
                  className={
                    styles.chatUserInfo
                  }
                >

                  <strong>
                    {activeUser.name}
                  </strong>

                  <span>
                    @
                    {activeUser.handle.replace(
                      /^@/,
                      ""
                    )}
                  </span>

                </div>


                <div
                  className={
                    styles.chatHeaderActions
                  }
                >

                  <button
                    type="button"
                    aria-label="Refresh conversation"
                    onClick={
                      refreshActiveConversation
                    }
                    disabled={
                      refreshing
                    }
                  >
                    <MoreHorizontal
                      size={19}
                    />
                  </button>

                </div>

              </header>


              {/* ERROR */}

              {error && (

                <div
                  className={
                    styles.errorBar
                  }
                >

                  <span>
                    {error}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                  >
                    <X
                      size={15}
                    />
                  </button>

                </div>

              )}


              {/* ================================================= */}
              {/* MESSAGES */}
              {/* ================================================= */}

              <div
                ref={
                  messagesAreaRef
                }
                className={
                  styles.messagesArea
                }
              >

                {activeMessages.length ===
                0 ? (

                  <div
                    className={
                      styles.conversationIntro
                    }
                  >

                    <div
                      className={
                        styles.largeAvatar
                      }
                    >
                      {getInitials(
                        activeUser.name
                      )}
                    </div>

                    <strong>
                      {activeUser.name}
                    </strong>

                    <span>
                      @
                      {activeUser.handle.replace(
                        /^@/,
                        ""
                      )}
                    </span>

                    <p>
                      This is the beginning of your
                      conversation.
                    </p>

                  </div>

                ) : (

                  <div
                    className={
                      styles.messageList
                    }
                  >

                    {activeMessages.map(
                      (item) => {

                        const isMine =
                          item.sender_id ===
                          currentUser?.id;


                        return (
                          <div
                            key={
                              item.id
                            }
                            className={`${styles.messageRow} ${
                              isMine
                                ? styles.myMessageRow
                                : styles.theirMessageRow
                            }`}
                          >

                            {!isMine && (

                              <div
                                className={
                                  styles.smallAvatar
                                }
                              >
                                {getInitials(
                                  activeUser.name
                                )}
                              </div>

                            )}


                            <div
                              className={
                                styles.messageGroup
                              }
                            >

                              <div
                                className={`${styles.bubble} ${
                                  isMine
                                    ? styles.myBubble
                                    : styles.theirBubble
                                }`}
                              >

                                {item.image_url && (

                                  <a
                                    href={
                                      item.image_url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className={
                                      styles.messageImageLink
                                    }
                                  >

                                    <img
                                      src={
                                        item.image_url
                                      }
                                      alt="Shared image"
                                      className={
                                        styles.messageImage
                                      }
                                    />

                                  </a>

                                )}


                                {item.text && (

                                  <div
                                    className={
                                      styles.messageText
                                    }
                                  >
                                    {item.text}
                                  </div>

                                )}

                              </div>


                              <div
                                className={`${styles.messageMeta} ${
                                  isMine
                                    ? styles.myMeta
                                    : ""
                                }`}
                              >

                                <span>
                                  {
                                    formatMessageTime(
                                      item.created_at
                                    )
                                  }
                                </span>


                                {isMine && (

                                  item.read ? (

                                    <CheckCheck
                                      size={
                                        13
                                      }
                                    />

                                  ) : (

                                    <Check
                                      size={
                                        13
                                      }
                                    />

                                  )

                                )}

                              </div>

                            </div>

                          </div>
                        );

                      }
                    )}

                  </div>

                )}

              </div>


              {/* ================================================= */}
              {/* IMAGE PREVIEW */}
              {/* ================================================= */}

              {imagePreview && (

                <div
                  className={
                    styles.imagePreviewBar
                  }
                >

                  <img
                    src={
                      imagePreview
                    }
                    alt="Selected image"
                    className={
                      styles.imagePreview
                    }
                  />


                  <div
                    className={
                      styles.imagePreviewInfo
                    }
                  >

                    <strong>
                      Image selected
                    </strong>

                    <span>
                      {
                        selectedImage?.name
                      }
                    </span>

                  </div>


                  <button
                    type="button"
                    onClick={
                      removeSelectedImage
                    }
                    aria-label="Remove image"
                  >
                    <X
                      size={17}
                    />
                  </button>

                </div>

              )}


              {/* ================================================= */}
              {/* COMPOSER */}
              {/* ================================================= */}

              <form
                className={
                  styles.composer
                }
                onSubmit={
                  handleSubmit
                }
              >

                <div
                  className={
                    styles.composerActions
                  }
                >

                  <button
                    type="button"
                    aria-label="Attach image"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <ImageIcon
                      size={18}
                    />
                  </button>


                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    hidden
                    onChange={
                      handleImageChange
                    }
                  />

                </div>


                <textarea
                  value={
                    message
                  }
                  onChange={(
                    event
                  ) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder={
                    selectedImage
                      ? "Add a message..."
                      : "Write a message..."
                  }
                  rows={1}
                  disabled={
                    sending
                  }
                />


                <button
                  type="button"
                  className={
                    styles.emojiButton
                  }
                  aria-label="Add emoji"
                >
                  <Smile
                    size={18}
                  />
                </button>


                <button
                  type="submit"
                  className={
                    styles.sendButton
                  }
                  disabled={
                    sending ||
                    (
                      !message.trim() &&
                      !selectedImage
                    )
                  }
                  aria-label="Send message"
                >

                  {sending ? (

                    <span
                      className={
                        styles.sendSpinner
                      }
                    />

                  ) : (

                    <Send
                      size={16}
                    />

                  )}

                </button>

              </form>

            </>

          ) : (

            /* ================================================= */
            /* EMPTY CHAT */
            /* ================================================= */

            <div
              className={
                styles.emptyChat
              }
            >

              <div
                className={
                  styles.emptyChatIcon
                }
              >
                <Send
                  size={25}
                />
              </div>

              <h2>
                Your Messages
              </h2>

              <p>
                Select a conversation or start
                a new message.
              </p>

              <button
                type="button"
                onClick={
                  openNewMessage
                }
              >
                <UserPlus
                  size={16}
                />

                New Message
              </button>

            </div>

          )}

        </section>

      </div>

    </div>
  );
}