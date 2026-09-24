const PHOTOS = {
  hero: "/images/hero.png",
  learn: "/images/learn.png",
  rights: "/images/rights.png",
  support: "/images/support.png",
  document: "/images/document.png",
};

export function HeroArt() {
  return <img src={PHOTOS.hero} alt="" />;
}

export function TileArt({ id }) {
  return <img src={PHOTOS[id]} alt="" />;
}
