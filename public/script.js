document.getElementById("userForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const response = await fetch("/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(user)
    });

    const data = await response.json();
    if (response.ok) {
        alert("Registration Successful! Please login with your credentials.");
        window.location.href = "login.html";
    } else {
        alert("Error: " + data.error);
    }
});
