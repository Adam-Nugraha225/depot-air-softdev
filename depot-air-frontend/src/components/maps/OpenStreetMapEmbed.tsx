'use client';

interface OpenStreetMapEmbedProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  title?: string;
  className?: string;
}

export default function OpenStreetMapEmbed({
  centerLat,
  centerLng,
  zoom = 14,
  title = 'Peta lokasi pengiriman',
  className = '',
}: OpenStreetMapEmbedProps) {
  const delta = zoom >= 14 ? 0.018 : 0.05;
  const bbox = [
    centerLng - delta,
    centerLat - delta,
    centerLng + delta,
    centerLat + delta,
  ].join(',');
  const marker = `${centerLat},${centerLng}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;

  return (
    <iframe
      title={title}
      src={src}
      className={`h-full w-full border-0 ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
