const ContactMessage = require("../models/ContactMessage");
const User = require("../models/User");
const { sendAdminMessageNotificationEmail } = require("./email");

const frequencyToMs = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

const defaultScheduleTime = "09:00";

const getScheduleInterval = () => {
  const frequency = (process.env.FREQUENCY || "daily").toLowerCase();
  return frequencyToMs[frequency] || frequencyToMs.daily;
};

const getScheduleTime = () =>
  process.env.ADMIN_MESSAGE_DIGEST_TIME ||
  process.env.SCHEDULE_TIME ||
  defaultScheduleTime;

const parseScheduleTime = (timeValue) => {
  const [hoursPart, minutesPart] = String(timeValue).split(":");
  const hours = Number.parseInt(hoursPart, 10);
  const minutes = Number.parseInt(minutesPart, 10);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { hours: 9, minutes: 0 };
  }

  return { hours, minutes };
};

const getNextRunDelay = () => {
  const { hours, minutes } = parseScheduleTime(getScheduleTime());
  const now = new Date();
  const nextRun = new Date(now);

  nextRun.setHours(hours, minutes, 0, 0);

  if (nextRun < now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
};

const sendAdminMessageDigest = async () => {
  const messages = await ContactMessage.find({
    status: { $in: ["new", "pending", "in-progress"] },
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  if (!messages.length) {
    return;
  }

  const admins = await User.find({ role: "admin" }).select("email name");
  if (!admins.length) {
    return;
  }

  await Promise.all(
    admins
      .filter((adminUser) => adminUser.email)
      .map((adminUser) =>
        sendAdminMessageNotificationEmail({
          to: adminUser.email,
          messageCount: messages.length,
          messages,
        }),
      ),
  );
};

const startAdminMessageScheduler = () => {
  if (process.env.DISABLE_ADMIN_MESSAGE_SCHEDULER === "true") {
    return;
  }

  const interval = getScheduleInterval();
  let timeoutId = null;
  let intervalId = null;

  const run = async () => {
    try {
      await sendAdminMessageDigest();
    } catch (error) {
      console.error("Admin message scheduler error:", error);
    }
  };

  const scheduleNextRun = () => {
    const delay = getNextRunDelay();

    timeoutId = setTimeout(async () => {
      await run();
      intervalId = setInterval(run, interval);
    }, delay);
  };

  scheduleNextRun();

  return {
    stop() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  };
};

module.exports = {
  startAdminMessageScheduler,
};
