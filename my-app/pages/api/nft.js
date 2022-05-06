// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.nft;

  const name = `Ukraine Relief Token`;

  const description =
    "Ukraine Relief Token is a complimentary token for whoever donates to Ukraine Relief Funds";

  const image =
    "https://raw.githubusercontent.com/cloudmate404/donation/main/my-app/public/ukraineNFT.svg";

  return res.json({
    name: name,
    description: description,
    image: image,
  });
}
