export const posts = [
  {
    id: 1,
    user: "Alex Tan",
    handle: "@alextan",
    time: "18m",
    avatar: "AT",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
    caption:
      "Finally finished my Neo65 build. FR4 plate + Oil Kings = exactly the sound I wanted.",
    keyboard: "Neo65",
    tags: ["#neo65", "#oilking", "#thock"],
    likes: 128,
    comments: 24,
    sponsored: false,
  },
  {
    id: 2,
    user: "KeyLab Malaysia",
    handle: "@keylabmy",
    time: "42m",
    avatar: "KL",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80",
    caption:
      "Weekend drop: 15% off selected switches. Free shipping over RM150.",
    keyboard: "Vendor offer",
    tags: ["#switches", "#malaysia"],
    likes: 84,
    comments: 9,
    sponsored: true,
  },
  {
    id: 3,
    user: "Maya Chen",
    handle: "@mayakeys",
    time: "1h",
    avatar: "MC",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80",
    caption:
      "Testing three linear switches side by side. Which one sounds deepest to you?",
    keyboard: "Switch test",
    tags: ["#soundtest", "#linear"],
    likes: 211,
    comments: 41,
    sponsored: false,
  },
];

export const switches = [
  {
    name: "Gateron Oil King",
    brand: "Gateron",
    type: "Linear",
    actuation: "55g",
    force: "80g",
    travel: "4.0mm",
    sound: "Deep / Thocky",
    rating: 4.8,
    tests: 38,
  },
  {
    name: "Gateron Baby Kangaroo",
    brand: "Gateron",
    type: "Tactile",
    actuation: "59g",
    force: "67g",
    travel: "3.4mm",
    sound: "Crisp / Pop",
    rating: 4.6,
    tests: 24,
  },
  {
    name: "Kailh Box White",
    brand: "Gateron",
    type: "Clicky",
    actuation: "55g",
    force: "60g",
    travel: "3.6mm",
    sound: "Sharp / Clicky",
    rating: 4.4,
    tests: 19,
  },
  {
    name: "Akko Cream Yellow",
    brand: "Gateron",
    type: "Linear",
    actuation: "50g",
    force: "60g",
    travel: "3.5mm",
    sound: "Creamy / Smooth",
    rating: 4.7,
    tests: 31,
  },
];

export const keyboards = [
  {
    name: "Neo65",
    brand: "Neo Studio",
    layout: "65%",
    mount: "Gasket",
    material: "Aluminium",
    rating: 4.8,
    builds: 184,
  },
  {
    name: "Keychron Q1",
    brand: "Keychron",
    layout: "75%",
    mount: "Gasket",
    material: "Aluminium",
    rating: 4.6,
    builds: 312,
  },
  {
    name: "Zoom75",
    brand: "Meletrix",
    layout: "75%",
    mount: "Gasket",
    material: "Aluminium",
    rating: 4.7,
    builds: 127,
  },
  {
    name: "Mode Envoy",
    brand: "Mode",
    layout: "65%",
    mount: "Top",
    material: "Aluminium",
    rating: 4.9,
    builds: 93,
  },
];

export const listings = [
  {
    id: 1,
    title: "Neo65 Navy",
    price: "RM 520",
    condition: "Like new",
    location: "Subang Jaya",
    seller: "Daniel",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    title: "GMK Olivia Clone Set",
    price: "RM 85",
    condition: "New",
    location: "Kuala Lumpur",
    seller: "Sara",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    title: "Gateron Oil King x90",
    price: "RM 115",
    condition: "New",
    location: "Petaling Jaya",
    seller: "Irfan",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=700&q=80",
  },
];