import prisma from "../../db/prisma";

const getTravelBuddiesByTripIdFromDB = async (tripId: string) => {
  const result = await prisma.travelBuddyRequest.findMany({
    where: {
      tripId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

export const TravelBuddyServices = {
  getTravelBuddiesByTripIdFromDB,
};
