const AVATAR_PALETTE = [
  "f59e0b", "ef4444", "10b981", "3b82f6", "8b5cf6",
  "ec4899", "14b8a6", "f97316", "6366f1", "84cc16",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProviderAvatarUrl(
  current: string | null | undefined,
  name: string,
): string {
  if (current && current.trim().length > 0) return current;
  const safeName = encodeURIComponent(name?.trim() || "User");
  const color = AVATAR_PALETTE[hashString(name || "User") % AVATAR_PALETTE.length];
  return `https://ui-avatars.com/api/?name=${safeName}&background=${color}&color=fff&bold=true&size=256&format=svg`;
}

const CATEGORY_IMAGES: Record<string, string> = {
  cooking:
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=70",
  baking:
    "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=70",
  catering:
    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=70",
  food:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=70",
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70",
  plumbing:
    "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=70",
  electrical:
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=70",
  carpentry:
    "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=800&q=70",
  repair:
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=70",
  tour:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=70",
  teaching:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=70",
  language:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=70",
  weaving:
    "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=70",
  pottery:
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=70",
  woodworking:
    "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=800&q=70",
  delivery:
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=70",
  moving:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70",
  farming:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=70",
  default:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=70",
};

export function getGigImageUrl(
  current: string | null | undefined,
  category: string | null | undefined,
): string {
  if (current && current.trim().length > 0) return current;
  const key = (category || "").toLowerCase().trim();
  for (const [k, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k)) return url;
  }
  return CATEGORY_IMAGES.default;
}
