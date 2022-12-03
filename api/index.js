// Config
import "dotenv/config";

// Imports
import { SuperfaceClient } from "@superfaceai/one-sdk";
import express from "express";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const app = express();

app.set("trust proxy", true);

const sdk = new SuperfaceClient();

async function run(ip) {
  // Load the profile
  const profile = await sdk.getProfile("address/ip-geolocation@1.0.1");

  // Use the profile
  const result = await profile.getUseCase("IpGeolocation").perform(
    {
      ipAddress: ip,
    },
    {
      provider: "ipdata",
      security: {
        apikey: {
          apikey: process.env.IPDATA_KEY,
        },
      },
    }
  );

  // Handle the result
  try {
    const data = result.unwrap();
    return data;
  } catch (error) {
    console.error(error);
  }
}

app.get("/", async (req, res) => {
  function getIP(req) {
    const conRemoteAddress = req.connection?.remoteAddress;
    const socketRemoteAddress = req.socket?.remoteAddress;
    const xRealIP = req.headers["x-real-ip"];
    const xForwardedForIP = (() => {
      const xForwardedFor = req.headers["x-forwarded-for"];

      if (xForwardedFor) {
        const ip = xForwardedFor.split(",").map((ip) => ip.trim());

        return ip[0];
      }
    })();

    return (
      xForwardedForIP || xRealIP || socketRemoteAddress || conRemoteAddress
    );
  }

  const ip = getIP(req);

  console.log(ip);

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  const IpGeolocation = await run(ip);

  res.json({
    status: 200,
    message: "Success",
    IpGeolocation,
  });
});

export default app;
