define(['dict'], (dict) => {

    return (key, ...replaces)=> {
        let res = dict[key];

        if (res) {
            replaces.forEach(replace => {
                res = res.replace('%s', replace);
            });

            return res;
        }

        return key;
    };

});
