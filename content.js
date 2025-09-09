console.log("Email Writer Extension - Content Script Loaded");

function findComposeToolbar() {
    
    const selectors = [
        '.gU.Up',         
        '.btC',          
        '.aDh',
        '[role="toolbar"]'
    ];
    
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            console.log("Toolbar found with selector:", selector);
            return toolbar;
        }
    }
    return null;
}

function getEmailContent() {
    
    const selectors = [
        '.gmail_quote .a3s', 
        '.a3s.aiL',         
        '.adA',              
        'div[dir="ltr"]'     
    ];
    
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            console.log("Email content found with selector:", selector);
            return content.innerText.trim();
        }
    }
    return '';
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) return; 

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found, will retry...");
        return;
    }

    const button = createAIButton();
    button.classList.add("ai-reply-button");

    button.addEventListener('click', async () => {
        button.innerHTML = 'Generating...';
        button.disabled = true;

        try {
            const emailContent = getEmailContent();
            if (!emailContent) {
                console.warn("Could not find previous email content. Sending request without it.");
            }

            console.log("Sending to API:", emailContent);

            //Enter your backend api route that fetches the reply from gemini
            const response = await fetch("http://YourBackendRoute" , {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                
                const errorText = await response.text();
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error("Compose box not found!");
            }
        } catch (error) {
           
            console.error("Error generating AI reply:", error);
            alert("Failed to generate the reply. Check the console for details.");
        } finally {
            button.innerHTML = "AI Reply";
            button.disabled = false;
        }
    });
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          
            const composeWindowAdded = Array.from(mutation.addedNodes).some(
                node => node.nodeType === Node.ELEMENT_NODE && (node.querySelector('.btC, .aDh, [role="dialog"]') || node.matches('.btC, .aDh, [role="dialog"]'))
            );
            if (composeWindowAdded) {
                console.log("Compose window detected");
                
                setTimeout(injectButton, 1000);
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });