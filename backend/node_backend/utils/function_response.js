export default function (status, message, next_action, others={}) {
  return {
    status, message, next_action, ...others,
  }
};
