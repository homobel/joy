define(['tpl/layout'], (layout) => {
    const html = layout({
        name: '<i>Triggre</i>',
        greeting: "Hi",
        staff: [
            {
                name: 'Archy',
                age: 27
            },
            {
                name: 'Denis',
                age: 'ancient'
            }
        ]
    });

    document.body.innerHTML = html;

    console.log(html);
});
