
const dateNow = () => {
    const date = new Date();

    const formattedDate: string = date.toLocaleDateString("en-US", {
      day: "numeric",
      weekday: "long",
      year: "numeric",
      month: "long",
    });

    return formattedDate;
  };

export default dateNow;