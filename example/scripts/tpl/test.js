define(["joy-runtime"], function(joy) {
  return function(data) {
    data = joy.o(data);
    return (
      joy.e(
        joy.p(
          foo({
            name: 12,
            content: joy.e(
              joy.p(
                foo({
                  name: 12,
                  content: joy.e(joy.p(foo({ name: 12, content: "<span>" })))
                })
              )
            )
          })
        )
      ) + "\r\n"
    );
  };
});
