"use client";

import {
  Hash,
  Lock,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Community.module.css";

type Room = {
  id: number;
  name: string;
  description: string;
  category: string;
  members: number;
  maxMembers: number;
  private: boolean;
  owner: boolean;
  joined: boolean;
  color: string;
  createdAt: string;
};

const defaultRooms: Room[] = [
  {
    id: 1,
    name: "Mechanical Keyboard Beginners",
    description:
      "New to mechanical keyboards? Ask questions, share your first build and learn from the community.",
    category: "General",
    members: 1248,
    maxMembers: 5000,
    private: false,
    owner: false,
    joined: true,
    color: "#7667b7",
    createdAt: "2 days ago",
  },
  {
    id: 2,
    name: "Custom Keyboard Builds",
    description:
      "Share your latest keyboard builds, modifications, layouts, plates and mounting styles.",
    category: "Builds",
    members: 864,
    maxMembers: 3000,
    private: false,
    owner: false,
    joined: false,
    color: "#596c9c",
    createdAt: "3 days ago",
  },
  {
    id: 3,
    name: "Switch Talk",
    description:
      "Discuss linear, tactile, clicky and silent switches. Share sound tests and tuning tips.",
    category: "Switches",
    members: 732,
    maxMembers: 2500,
    private: false,
    owner: false,
    joined: false,
    color: "#8c647d",
    createdAt: "5 days ago",
  },
  {
    id: 4,
    name: "Keycap Collectors",
    description:
      "A place for keycap collectors to show their sets, discuss profiles and find new releases.",
    category: "Keycaps",
    members: 529,
    maxMembers: 2000,
    private: false,
    owner: false,
    joined: false,
    color: "#627c76",
    createdAt: "1 week ago",
  },
  {
    id: 5,
    name: "Keyboard Sound Tests",
    description:
      "Compare sound signatures, microphones, plates, switches and different keyboard builds.",
    category: "Sound Tests",
    members: 418,
    maxMembers: 1500,
    private: false,
    owner: false,
    joined: false,
    color: "#806a52",
    createdAt: "1 week ago",
  },
  {
    id: 6,
    name: "Bangladesh Mechanical Keyboard",
    description:
      "Connect with mechanical keyboard enthusiasts in Bangladesh and discuss local availability, vendors and builds.",
    category: "Bangladesh",
    members: 387,
    maxMembers: 1500,
    private: false,
    owner: false,
    joined: false,
    color: "#4f7565",
    createdAt: "2 weeks ago",
  },
];

const categories = [
  "All",
  "General",
  "Builds",
  "Switches",
  "Keycaps",
  "Sound Tests",
  "Bangladesh",
  "Other",
];

export default function CommunityPage() {
  const router = useRouter();

  const [rooms, setRooms] =
    useState<Room[]>(defaultRooms);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  useEffect(() => {
    const saved = localStorage.getItem(
      "mechabook-community-rooms"
    );

    if (!saved) {
      localStorage.setItem(
        "mechabook-community-rooms",
        JSON.stringify(defaultRooms)
      );

      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setRooms(parsed);
      }
    } catch {
      localStorage.setItem(
        "mechabook-community-rooms",
        JSON.stringify(defaultRooms)
      );
    }
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesCategory =
        category === "All" ||
        room.category === category;

      const query =
        search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        room.name
          .toLowerCase()
          .includes(query) ||
        room.description
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [rooms, category, search]);

  const toggleJoin = (roomId: number) => {
    const nextRooms = rooms.map((room) => {
      if (room.id !== roomId) {
        return room;
      }

      if (
        !room.joined &&
        room.members >= room.maxMembers
      ) {
        return room;
      }

      return {
        ...room,
        joined: !room.joined,
        members: room.joined
          ? Math.max(0, room.members - 1)
          : room.members + 1,
      };
    });

    setRooms(nextRooms);

    localStorage.setItem(
      "mechabook-community-rooms",
      JSON.stringify(nextRooms)
    );
  };

  const deleteRoom = (roomId: number) => {
    const confirmed = window.confirm(
      "Delete this community room?"
    );

    if (!confirmed) return;

    const nextRooms = rooms.filter(
      (room) => room.id !== roomId
    );

    setRooms(nextRooms);

    localStorage.setItem(
      "mechabook-community-rooms",
      JSON.stringify(nextRooms)
    );
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            MECHABOOK COMMUNITY
          </p>

          <h1>Community</h1>

          <p className={styles.description}>
            Find people with similar interests,
            join discussions and build communities
            around mechanical keyboards.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() =>
            router.push(
              "/community/create-room"
            )
          }
        >
          <Plus size={17} />
          Create Room
        </button>
      </div>

      {/* Search */}
      <div className={styles.search}>
        <Search size={17} />

        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.categoryButton} ${
              category === item
                ? styles.categoryActive
                : ""
            }`}
            onClick={() =>
              setCategory(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <Users size={17} />

          <div>
            <strong>
              {rooms.length}
            </strong>

            <span>Communities</span>
          </div>
        </div>

        <div className={styles.stat}>
          <MessageCircle size={17} />

          <div>
            <strong>
              {rooms
                .reduce(
                  (total, room) =>
                    total + room.members,
                  0
                )
                .toLocaleString()}
            </strong>

            <span>Total Members</span>
          </div>
        </div>

        <div className={styles.stat}>
          <Hash size={17} />

          <div>
            <strong>
              {categories.length - 1}
            </strong>

            <span>Topics</span>
          </div>
        </div>
      </div>

      {/* Room heading */}
      <div className={styles.sectionHeader}>
        <div>
          <h2>Explore Communities</h2>

          <p>
            Join a room and start talking with
            other keyboard enthusiasts.
          </p>
        </div>

        <span className={styles.resultCount}>
          {filteredRooms.length} rooms
        </span>
      </div>

      {/* Rooms */}
      {filteredRooms.length === 0 ? (
        <div className={styles.empty}>
          <Search size={32} />

          <h2>
            No communities found
          </h2>

          <p>
            Try another search or category.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRooms.map((room) => (
            <article
              key={room.id}
              className={styles.card}
            >
              {/* Room cover */}
              <div
                className={styles.cover}
                style={{
                  background:
                    `linear-gradient(135deg, ${room.color}, #15131c)`,
                }}
              >
                <div
                  className={styles.roomIcon}
                >
                  <Hash size={24} />
                </div>

                {room.private && (
                  <span
                    className={
                      styles.privateBadge
                    }
                  >
                    <Lock size={11} />
                    Private
                  </span>
                )}

                {room.owner && (
                  <span
                    className={
                      styles.ownerBadge
                    }
                  >
                    Your Room
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <div>
                    <span
                      className={
                        styles.roomCategory
                      }
                    >
                      {room.category}
                    </span>

                    <h3>{room.name}</h3>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.settingsButton
                    }
                    aria-label="Room settings"
                    onClick={() => {
                      if (room.owner) {
                        deleteRoom(
                          room.id
                        );
                      }
                    }}
                    title={
                      room.owner
                        ? "Delete your room"
                        : "Room settings"
                    }
                  >
                    <Settings size={15} />
                  </button>
                </div>

                <p
                  className={
                    styles.roomDescription
                  }
                >
                  {room.description}
                </p>

                <div
                  className={styles.roomMeta}
                >
                  <span>
                    <Users size={14} />

                    {room.members.toLocaleString()}{" "}
                    members
                  </span>

                  <span>
                    {room.private
                      ? "Private"
                      : "Public"}
                  </span>
                </div>

                <div
                  className={
                    styles.cardActions
                  }
                >
                  <button
                    type="button"
                    className={
                      room.joined
                        ? styles.joinedButton
                        : styles.joinButton
                    }
                    onClick={() =>
                      toggleJoin(room.id)
                    }
                  >
                    {room.joined
                      ? "Joined"
                      : "Join Room"}
                  </button>

                  <button
                    type="button"
                    className={
                      styles.discussButton
                    }
                  >
                    <MessageCircle
                      size={15}
                    />
                    Discuss
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <section
        className={styles.bottomCta}
      >
        <div
          className={styles.bottomIcon}
        >
          <Plus size={22} />
        </div>

        <div>
          <h2>
            Can't find your community?
          </h2>

          <p>
            Create your own room and bring
            people together around your
            keyboard interests.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() =>
            router.push(
              "/community/create-room"
            )
          }
        >
          Create Room
        </button>
      </section>
    </div>
  );
}