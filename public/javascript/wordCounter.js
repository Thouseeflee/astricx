textarea.addEventListener("input", event => {
    const target = event.currentTarget;
    const maxLength = target.getAttribute("maxlength");
    const currentLength = target.value.length;

    if (currentLength >= maxLength) {
        return console.log("You have reached the maximum number of characters.");
    }
    
     count.innerText = `${currentLength}`
    //  count.innerText = `${maxLength - currentLength}`
});
