const messages = [
  "Season End Sale — Up to 40% Off",
  "Complimentary Shipping on Orders Over PKR 15,000",
  "Cash on Delivery Available Nationwide",
  "New Arrivals Every Week",
];

export function AnnouncementBar() {
  const strip = [...messages, ...messages];
  return (
    <div className="bg-ink text-ivory overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2.5 will-change-transform">
        {strip.map((m, i) => (
          <span
            key={i}
            className="mx-8 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold-200"
          >
            {m}
            <span className="ml-8 text-gold-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
