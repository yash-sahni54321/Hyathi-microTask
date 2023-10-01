import * as redis from "redis";

export class RedisClient {
    private client: any;
    private isConnected: boolean = false;
    constructor() {
        this.initializeClient();
    }

    private async initializeClient() {
        try {
            this.client = redis.createClient({
                url: "redis://localhost:6379",
            });

            this.client.on("connect", () => {
                console.log("Connected to Redis server");
            });

            this.client.on("error", (err: any) => {
                // console.error("Redis connection error: ", err);
            });

            await this.client.connect();
            this.isConnected = true;
        } catch (error) {
            console.log("Could not Connect Redis Server", error);
        }
    }

    public async get(key: string) {
        console.log("isConnected", this.isConnected);
        if (!this.isConnected) {
            return null;
        }
        const cachedValue = await this.client.get(key);
        if (!cachedValue) {
            return null;
        }
        return JSON.parse(cachedValue);
    }

    public async set(key: string, value: any) {
        if (!this.isConnected) {
            return;
        }
        await this.client.set(key, JSON.stringify(value));
    }
    public async delete(key: string) {
        if (!this.isConnected) {
            return;
        }
        await this.client.del(key);
    }

    close() {
        this.client.quit();
    }
}

// Example usage
// (async () => {
//     const redisClient = new RedisClient();

//     const key = "myKey";
//     const value = { name: "John", age: 30 };

//     try {
//         await redisClient.set(key, value);
//         const retrievedValue = await redisClient.get(key);
//         console.log("Retrieved value:", retrievedValue);
//     } catch (error) {
//         console.error("Redis error:", error);
//     } finally {
//         redisClient.close();
//     }
// })();
