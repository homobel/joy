define(['tpl/layout', 'model'], (layout, model) => {
    document.body.innerHTML = layout(model);
});
