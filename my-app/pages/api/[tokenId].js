// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;

  const name = `Ukraine Relief Token #${tokenId}`;

  const description =
    "Ukraine Relief Token is a complimentary token for whoever donates to Ukraine Relief Funds";

  const image =
    "https://raw.githubusercontent.com/cloudmate404/donation/main/my-app/public/ukraineNFT.png";

  return res.json({
    name: name,
    description: description,
    image: image,
  });
}
