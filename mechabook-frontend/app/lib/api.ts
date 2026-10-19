const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// TYPES
// ============================================================

export type User = {
  id: number;
  name: string;
  handle: string;
  email: string;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
  cover?: string | null;
  star_badge: boolean;
  is_admin: boolean;
};


export type Post = {
  id: number;
  user_id: number;
  caption: string;
  image?: string | null;
  keyboard?: string | null;
  tags?: string | null;
  likes: number;
  comments: number;
  sponsored: boolean;
};


export type Listing = {
  id: number;
  user_id: number;
  title: string;
  description?: string | null;
  price: string;
  condition: string;
  location: string;
  image?: string | null;
  status?: string | null;
};


export type Community = {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  members: number;
  max_members: number;
  private: boolean;
  owner_id?: number | null;
};


export type SoundTest = {
  id: number;
  user_id: number;
  title?: string | null;
  keyboard?: string | null;
  switch_name?: string | null;
  plate?: string | null;
  lubed?: string | null;
  switches?: string | null;
  keycaps?: string | null;
  microphone?: string | null;
  description?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
};


// ============================================================
// MESSAGE TYPE
// ============================================================

export type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;

  /*
   * Text is optional because an image-only
   * message is allowed.
   */
  text?: string | null;

  /*
   * Supabase Storage image URL.
   */
  image_url?: string | null;

  read: boolean;

  created_at?: string | null;
};


// ============================================================
// MESSAGE USER SEARCH RESULT
// ============================================================

export type UserSearchResult = {
  id: number;
  name: string;
  handle: string;
  avatar?: string | null;
};


function getApiErrorMessage(
  data: unknown,
  fallback: string
): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const errorData = data as {
      detail?: unknown;
      message?: unknown;
      error?: unknown;
    };

    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    if (typeof errorData.message === "string") {
      return errorData.message;
    }

    if (typeof errorData.error === "string") {
      return errorData.error;
    }

    if (Array.isArray(errorData.detail)) {
      return errorData.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const detailItem = item as {
              msg?: unknown;
              message?: unknown;
            };

            if (typeof detailItem.msg === "string") {
              return detailItem.msg;
            }

            if (typeof detailItem.message === "string") {
              return detailItem.message;
            }
          }

          return JSON.stringify(item);
        })
        .join(", ");
    }
  }

  return fallback;
}


// ============================================================
// GENERIC API REQUEST
// ============================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("mechabook-token")
      : null;

  const headers = new Headers(options.headers);

  // JSON requests
  // Do NOT set Content-Type manually for FormData.
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const controller = new AbortController();

  // Prevent infinite "Adding..." / "Loading..." states.
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
        signal: controller.signal,
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      throw new Error(
        getApiErrorMessage(
          data,
          `Request failed with status ${response.status}`
        )
      );
    }

    return data as T;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "Request timed out. Please check whether the Mechabook backend is running."
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "Something went wrong while contacting the server."
    );
  } finally {
    clearTimeout(timeout);
  }
}


// ============================================================
// AUTH
// ============================================================

export type RegisterData = {
  name: string;
  handle: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  avatar?: string;
  cover?: string;
};


export type LoginData = {
  email: string;
  password: string;
};


export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};


export async function registerUser(
  data: RegisterData
) {

  return apiRequest<User>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

}


export async function loginUser(
  data: LoginData
) {

  return apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

}


export async function getCurrentUser() {

  return apiRequest<User>(
    "/auth/me",
    {
      method: "GET",
    }
  );

}


// ============================================================
// USERS
// ============================================================

export type UpdateUserData = {
  name?: string;
  handle?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  cover?: string;
  star_badge?: boolean;
};


export async function getUsers() {

  return apiRequest<User[]>(
    "/users",
    {
      method: "GET",
    }
  );

}


export async function getUser(
  userId: number
) {

  return apiRequest<User>(
    `/users/${userId}`,
    {
      method: "GET",
    }
  );

}


export async function updateUser(
  userId: number,
  data: UpdateUserData
) {

  return apiRequest<User>(
    `/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

}


export async function deleteUser(
  userId: number
) {

  return apiRequest<{
    message: string;
  }>(
    `/users/${userId}`,
    {
      method: "DELETE",
    }
  );

}


// ============================================================
// POSTS
// ============================================================

export type CreatePostData = {
  user_id: number;
  caption: string;
  image?: string;
  keyboard?: string;
  tags?: string;
};


export async function getPosts() {

  return apiRequest<Post[]>(
    "/posts",
    {
      method: "GET",
    }
  );

}


export async function getPost(
  postId: number
) {

  return apiRequest<Post>(
    `/posts/${postId}`,
    {
      method: "GET",
    }
  );

}


export async function createPost(
  data: CreatePostData
) {

  return apiRequest<Post>(
    "/posts",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

}


export async function deletePost(
  postId: number
) {

  return apiRequest<{
    message: string;
  }>(
    `/posts/${postId}`,
    {
      method: "DELETE",
    }
  );

}


// ============================================================
// MARKETPLACE
// ============================================================

export async function getListings() {

  return apiRequest<Listing[]>(
    "/marketplace",
    {
      method: "GET",
    }
  );

}


export async function getListing(
  listingId: number
) {

  return apiRequest<Listing>(
    `/marketplace/${listingId}`,
    {
      method: "GET",
    }
  );

}


// ============================================================
// CREATE MARKETPLACE LISTING
// ============================================================

export async function createListing(
  data: {
    title: string;
    description?: string;
    price: string;
    condition: string;
    location: string;
    category?: string;
    image?: File;
  }
) {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "mechabook-token"
        )
      : null;


  const formData =
    new FormData();


  formData.append(
    "title",
    data.title
  );


  formData.append(
    "description",
    data.description || ""
  );


  formData.append(
    "price",
    data.price
  );


  formData.append(
    "condition",
    data.condition
  );


  formData.append(
    "location",
    data.location
  );


  if (data.category) {

    formData.append(
      "category",
      data.category
    );

  }


  if (data.image) {

    formData.append(
      "image",
      data.image
    );

  }


  const headers: HeadersInit = {};


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_BASE_URL}/marketplace`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );


  const result =
    await response
      .json()
      .catch(() => null);


  if (!response.ok) {

    throw new Error(
      result?.detail ||
      `Request failed with status ${response.status}`
    );

  }


  return result as Listing;
}


// ============================================================
// UPDATE MARKETPLACE LISTING
// OWNER ONLY
// ============================================================

export async function updateListing(
  listingId: number,
  data: {
    title: string;
    description: string;
    price: string;
    condition: string;
    location: string;
    image?: File;
  }
) {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "mechabook-token"
        )
      : null;


  const formData =
    new FormData();


  formData.append(
    "title",
    data.title
  );


  formData.append(
    "description",
    data.description
  );


  formData.append(
    "price",
    data.price
  );


  formData.append(
    "condition",
    data.condition
  );


  formData.append(
    "location",
    data.location
  );


  if (data.image) {

    formData.append(
      "image",
      data.image
    );

  }


  const headers: HeadersInit = {};


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_BASE_URL}/marketplace/${listingId}`,
      {
        method: "PATCH",
        headers,
        body: formData,
      }
    );


  const result =
    await response
      .json()
      .catch(() => null);


  if (!response.ok) {

    throw new Error(
      result?.detail ||
      `Request failed with status ${response.status}`
    );

  }


  return result as Listing;
}


// ============================================================
// UPDATE MARKETPLACE STATUS
// ============================================================

export async function updateListingStatus(
  listingId: number,
  newStatus:
    | "active"
    | "pending"
    | "sold"
) {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "mechabook-token"
        )
      : null;


  const formData =
    new FormData();


  formData.append(
    "new_status",
    newStatus
  );


  const headers: HeadersInit = {};


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(
      `${API_BASE_URL}/marketplace/${listingId}/status`,
      {
        method: "PATCH",
        headers,
        body: formData,
      }
    );


  const result =
    await response
      .json()
      .catch(() => null);


  if (!response.ok) {

    throw new Error(
      result?.detail ||
      `Request failed with status ${response.status}`
    );

  }


  return result as Listing;
}


// ============================================================
// DELETE MARKETPLACE LISTING
// ============================================================

export async function deleteListing(
  listingId: number
) {

  return apiRequest<{
    message: string;
  }>(
    `/marketplace/${listingId}`,
    {
      method: "DELETE",
    }
  );

}


// ============================================================
// COMMUNITY
// ============================================================

export type CreateCommunityData = {
  name: string;
  description?: string;
  category: string;
  members?: number;
  max_members?: number;
  private?: boolean;
  owner_id?: number;
};


export async function getCommunities() {

  return apiRequest<Community[]>(
    "/communities",
    {
      method: "GET",
    }
  );

}


export async function getCommunity(
  communityId: number
) {

  return apiRequest<Community>(
    `/communities/${communityId}`,
    {
      method: "GET",
    }
  );

}


export async function createCommunity(
  data: CreateCommunityData
) {

  return apiRequest<Community>(
    "/communities",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

}


export async function deleteCommunity(
  communityId: number
) {

  return apiRequest<{
    message: string;
  }>(
    `/communities/${communityId}`,
    {
      method: "DELETE",
    }
  );

}


// ============================================================
// SOUND TEST
// ============================================================

export type CreateSoundTestData = {
  title?: string;
  keyboard?: string;
  switch_name?: string;
  plate?: string;
  lubed?: string;
  switches?: string;
  keycaps?: string;
  microphone?: string;
  description?: string;
  video_url?: string;
  audio_file?: File;
};


export async function getSoundTests(
  switchName?: string
) {

  const query =
    switchName
      ? `?switch_name=${encodeURIComponent(
          switchName
        )}`
      : "";


  return apiRequest<SoundTest[]>(
    `/sound-tests${query}`,
    {
      method: "GET",
    }
  );

}


export async function getSoundTest(
  soundTestId: number
) {

  return apiRequest<SoundTest>(
    `/sound-tests/${soundTestId}`,
    {
      method: "GET",
    }
  );

}


// ============================================================
// CREATE SOUND TEST
// MULTIPART / AUDIO UPLOAD
// ============================================================

export async function createSoundTest(
  data: CreateSoundTestData
) {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "mechabook-token"
        )
      : null;


  const formData =
    new FormData();


  if (data.title?.trim()) {
    formData.append(
      "title",
      data.title.trim()
    );
  }


  if (data.keyboard?.trim()) {
    formData.append(
      "keyboard",
      data.keyboard.trim()
    );
  }


  if (data.switch_name?.trim()) {
    formData.append(
      "switch_name",
      data.switch_name.trim()
    );
  }


  if (data.plate?.trim()) {
    formData.append(
      "plate",
      data.plate.trim()
    );
  }


  if (data.lubed?.trim()) {
    formData.append(
      "lubed",
      data.lubed.trim()
    );
  }


  if (data.switches?.trim()) {
    formData.append(
      "switches",
      data.switches.trim()
    );
  }


  if (data.keycaps?.trim()) {
    formData.append(
      "keycaps",
      data.keycaps.trim()
    );
  }


  if (data.microphone?.trim()) {
    formData.append(
      "microphone",
      data.microphone.trim()
    );
  }


  if (data.description?.trim()) {
    formData.append(
      "description",
      data.description.trim()
    );
  }


  if (data.video_url?.trim()) {
    formData.append(
      "video_url",
      data.video_url.trim()
    );
  }


  if (data.audio_file) {

    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/webm",
      "audio/mp4",
      "audio/x-m4a",
      "audio/m4a",
    ];


    if (
      !allowedTypes.includes(
        data.audio_file.type
      )
    ) {

      throw new Error(
        "Unsupported audio format. Please use MP3, WAV, OGG, WEBM or M4A."
      );

    }


    const maxSize =
      25 * 1024 * 1024;


    if (
      data.audio_file.size >
      maxSize
    ) {

      throw new Error(
        "Audio file cannot exceed 25 MB."
      );

    }


    formData.append(
      "audio_file",
      data.audio_file
    );

  }


  const headers: HeadersInit = {};


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  /*
   * Do NOT manually set Content-Type.
   *
   * Browser automatically creates:
   *
   * multipart/form-data;
   * boundary=...
   */

  const response =
    await fetch(
      `${API_BASE_URL}/sound-tests`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );


  const result =
    await response
      .json()
      .catch(() => null);


  if (!response.ok) {

    throw new Error(
      getApiErrorMessage(
        result,
        `Request failed with status ${response.status}`
      )
    );

  }


  return result as SoundTest;
}


// ============================================================
// DELETE SOUND TEST
// ============================================================

export async function deleteSoundTest(
  soundTestId: number
) {

  return apiRequest<{
    message: string;
  }>(
    `/sound-tests/${soundTestId}`,
    {
      method: "DELETE",
    }
  );

}


// ============================================================
// MESSAGES
// ============================================================

export type CreateMessageData = {
  receiver_id: number;
  text?: string | null;
};


// ============================================================
// GET MESSAGES
// ============================================================

export async function getMessages(
  userId?: number
) {

  const query =
    userId !== undefined
      ? `?user_id=${userId}`
      : "";


  return apiRequest<Message[]>(
    `/messages${query}`,
    {
      method: "GET",
    }
  );

}


// ============================================================
// SEND TEXT MESSAGE
// ============================================================

export async function sendMessage(
  data: CreateMessageData
) {

  const cleanText =
    data.text?.trim() || "";


  if (!cleanText) {

    throw new Error(
      "Message cannot be empty"
    );

  }


  return apiRequest<Message>(
    "/messages",
    {
      method: "POST",
      body: JSON.stringify({
        receiver_id:
          data.receiver_id,
        text:
          cleanText,
      }),
    }
  );

}


// ============================================================
// SEND IMAGE MESSAGE
// ============================================================

export async function sendImageMessage(
  receiverId: number,
  file: File,
  text?: string
) {

  if (!file) {

    throw new Error(
      "Please select an image."
    );

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

    throw new Error(
      "Only JPG, PNG, WEBP and GIF images are supported."
    );

  }


  const maxSize =
    10 * 1024 * 1024;


  if (
    file.size > maxSize
  ) {

    throw new Error(
      "Image size cannot exceed 10 MB."
    );

  }


  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "mechabook-token"
        )
      : null;


  const formData =
    new FormData();


  formData.append(
    "receiver_id",
    String(receiverId)
  );


  formData.append(
    "file",
    file
  );


  if (text?.trim()) {

    formData.append(
      "text",
      text.trim()
    );

  }


  const headers: HeadersInit = {};


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  /*
   * DO NOT add Content-Type here.
   *
   * Browser automatically generates:
   *
   * multipart/form-data;
   * boundary=...
   */

  const response =
    await fetch(
      `${API_BASE_URL}/messages/image`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );


  const result =
    await response
      .json()
      .catch(() => null);


  if (!response.ok) {

    throw new Error(
      getApiErrorMessage(
        result,
        `Request failed with status ${response.status}`
      )
    );

  }


  return result as Message;
}


// ============================================================
// MARK MESSAGE AS READ
// ============================================================

export async function markMessageRead(
  messageId: number
) {

  return apiRequest<Message>(
    `/messages/${messageId}/read`,
    {
      method: "PATCH",
    }
  );

}


// ============================================================
// SEARCH USERS FOR MESSAGES
// ============================================================

export async function searchUsers(
  query: string
) {

  const cleanQuery =
    query.trim();


  if (!cleanQuery) {

    return [];

  }


  return apiRequest<UserSearchResult[]>(
    `/search/users?q=${encodeURIComponent(
      cleanQuery
    )}`,
    {
      method: "GET",
    }
  );

}


// ============================================================
// GENERAL SEARCH
// ============================================================

export type SearchResult = {
  users?: User[];
  posts?: Post[];
  marketplace?: Listing[];
  communities?: Community[];
};


export async function searchMechaBook(
  query: string,
  type?: string
) {

  const params =
    new URLSearchParams();


  params.set(
    "q",
    query
  );


  if (
    type &&
    type !== "all"
  ) {

    params.set(
      "type",
      type
    );

  }


  return apiRequest<SearchResult>(
    `/search?${params.toString()}`,
    {
      method: "GET",
    }
  );

}

// ============================================================
// SWITCHES
// ============================================================

export type Switch = {
  id: number;

  user_id: number;

  name: string;

  brand: string;

  type: string;

  sound: string;

  actuation: string;

  force: string;

  travel: string;

  tests: number;

  description?: string | null;

  image?: string | null;

  rating: number;

  // Optional Sound Profile
  deep?: number | null;

  thocky?: number | null;

  clacky?: number | null;

  sharp?: number | null;

  created_at?: string | null;
};


export type CreateSwitchData = {
  name: string;

  brand: string;

  type: string;

  sound: string;

  actuation: string;

  force: string;

  travel: string;

  tests?: number;

  description?: string;

  image?: string;

  rating?: number;

  // Optional Sound Profile
  deep?: number;

  thocky?: number;

  clacky?: number;

  sharp?: number;
};


export type SwitchReview = {
  id: number;

  user_id: number;

  switch_name: string;

  rating: number;

  comment: string;

  created_at?: string | null;

  user_name: string;

  user_handle: string;

  user_avatar?: string | null;
};


// ============================================================
// GET ALL SWITCHES
// ============================================================

export async function getSwitches(): Promise<Switch[]> {
  return apiRequest<Switch[]>(
    "/switches",
    {
      method: "GET",
    }
  );
}


// ============================================================
// GET SWITCH BY NAME
// ============================================================

export async function getSwitchByName(
  switchName: string
): Promise<Switch> {
  return apiRequest<Switch>(
    `/switches/by-name/${encodeURIComponent(
      switchName
    )}`,
    {
      method: "GET",
    }
  );
}


// ============================================================
// CREATE SWITCH
// ============================================================

export async function createSwitch(
  data: CreateSwitchData
): Promise<Switch> {
  return apiRequest<Switch>(
    "/switches",
    {
      method: "POST",

      body: JSON.stringify({
        name: data.name.trim(),

        brand: data.brand.trim(),

        type: data.type.trim(),

        sound: data.sound.trim(),

        actuation: data.actuation.trim(),

        force: data.force.trim(),

        travel: data.travel.trim(),

        tests: data.tests ?? 0,

        description:
          data.description?.trim() || null,

        image:
          data.image || null,

        rating:
          data.rating ?? 0,

        /*
         * If Sound Profile was not entered,
         * send null so backend stores NULL.
         */
        deep:
          data.deep ?? null,

        thocky:
          data.thocky ?? null,

        clacky:
          data.clacky ?? null,

        sharp:
          data.sharp ?? null,
      }),
    }
  );
}


// ============================================================
// DELETE SWITCH
// ============================================================

export async function deleteSwitch(
  switchId: number
) {
  return apiRequest<{
    message: string;
  }>(
    `/switches/${switchId}`,
    {
      method: "DELETE",
    }
  );
}


// ============================================================
// GET SWITCH REVIEWS
// ============================================================

export async function getSwitchReviews(
  switchName: string
): Promise<SwitchReview[]> {
  return apiRequest<SwitchReview[]>(
    `/switches/reviews/${encodeURIComponent(
      switchName
    )}`,
    {
      method: "GET",
    }
  );
}


// ============================================================
// CREATE SWITCH REVIEW
// ============================================================

export async function createSwitchReview(
  data: {
    switch_name: string;

    rating: number;

    comment: string;
  }
): Promise<SwitchReview> {
  return apiRequest<SwitchReview>(
    "/switches/reviews",
    {
      method: "POST",

      body: JSON.stringify({
        switch_name:
          data.switch_name.trim(),

        rating:
          data.rating,

        comment:
          data.comment.trim(),
      }),
    }
  );
}