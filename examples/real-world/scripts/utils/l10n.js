define(['dict'], (dict) => {

    return (key, ...replaces)=> {
        let res = dict[key];

        if (res) {
            replaces.forEach(replace => {
                res = res.replace('%s', replace);
            });

            return res;
        }

        replaces.forEach(replace => {
            key = key.replace('%s', replace);
        });

        return key;
    };

});
