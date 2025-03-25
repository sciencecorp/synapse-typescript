import dgram from "dgram";

export const getClientIp = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      const socket = dgram.createSocket("udp4");

      socket.on("error", (err) => {
        console.error(err);
        socket.close();
        reject(err);
      });

      socket.bind(0, () => {
        try {
          socket.connect(53, "8.8.8.8", () => {
            try {
              const address = socket.address();
              socket.close();
              resolve(address.address);
            } catch (e) {
              socket.close();
              reject(e);
            }
          });
        } catch (e) {
          socket.close();
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
