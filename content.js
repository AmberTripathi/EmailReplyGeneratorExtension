console.log("Email Writer Extension - Content Script Loaded");

function findComposeToolbar() {
    const selectors = ['.btC','.aDh','[role = "toolbar"]','.gU.Up'];
    
    for(const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if(toolbar) {
            return toolbar;
        }
        return null;
    }
}
function createAIButton() {

}
function injectButton() {
    const existingButton =  document.querySelector('.ai-reply-button');
    if(existingButton) existingButton.remove;
    const toolbar = findComposeToolbar()
    if(!toolbar) {
        console.log("Toolbar not found")
        return;
    }
    console.log("Toolbar found")
    const button = createAIButton();
    button.classList.add("ai-reply-button");

    button.addEventListener('click',async()=>{

    });
    toolbar.insertBefore(button, toolbar.firstChild);
}
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hadComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );
    if(hadComposeElements) {
        console.log("Compose window detected")
        setTimeout(injectButton ,500);
    }
  }
});
observer.observe(document.body, {childList:true,subtree:true})