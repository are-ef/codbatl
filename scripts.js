// Function to ensure the user is logged in
function ensureLoggedIn() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        alert("You must be signed in to access this page.");
        window.location.href = "index.html"; // Redirect to sign-in page
    }
}

// Function to load user profile data
function loadProfile() {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.codUsername === currentUser);

    if (!currentUser) {
        alert("You must be signed in to view this page.");
        window.location.href = "index.html"; // Redirect to sign-in page
        return;
    }

    let matches = JSON.parse(localStorage.getItem("matches")) || [];

    // Populate profile form with user data
    document.getElementById("bio").value = user.bio || "";
    if (user.avatar) {
        document.getElementById("avatar-preview").innerHTML = `
            <img src="${user.avatar}" alt="Avatar" style="max-width: 200px; max-height: 200px; border-radius: 50%;">
        `;
    }
}

// Function to handle user authentication (Sign In)
function handleAuth(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.codUsername === username && u.password === password);

    // Validate user credentials
    if (user) {
        localStorage.setItem("currentUser", username);
        alert("Sign-in successful!");
        window.location.href = "profile.html"; // Redirect to the profile page
    } else {
        alert("Invalid username or password. Please try again.");
    }
}

// Function to handle user sign-up
function handleSignUp(event) {
    event.preventDefault();

    const newUsername = document.getElementById("new-username").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    // Check if username already exists
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(user => user.codUsername === newUsername)) {
        alert("Username already exists. Please choose a different username.");
        return;
    }

    // Add new user
    const newUser = { codUsername: newUsername, password: newPassword, bio: "", avatar: "", team: null };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Sign-up successful! You can now sign in.");
    window.location.href = "index.html"; // Redirect to the sign-in page
}

// Function to update the user profile (bio, avatar)
function updateProfile(event) {
    event.preventDefault(); // Prevent form submission

    const bio = document.getElementById("bio").value;
    const avatarInput = document.getElementById("avatar");
    let avatarUrl = "";

    if (avatarInput.files && avatarInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarUrl = e.target.result;
            updateUserProfile(bio, avatarUrl);
        };
        reader.readAsDataURL(avatarInput.files[0]);
    } else {
        updateUserProfile(bio, avatarUrl);
    }
}

// Helper function to update the user profile data in localStorage
function updateUserProfile(bio, avatarUrl) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = localStorage.getItem("currentUser");

    const user = users.find(u => u.codUsername === currentUser);
    if (user) {
        user.bio = bio;
        user.avatar = avatarUrl;
        localStorage.setItem("users", JSON.stringify(users));

        alert("Profile updated successfully!");
        loadProfile(); // Reload the profile data to reflect changes
    }
}

// Function to edit the team name or leader
function editTeam() {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.codUsername === currentUser);

    if (user && user.team) {
        // Allow the user to edit the team name and leader
        const newTeamName = prompt("Enter a new team name:", user.team.name);
        if (newTeamName && newTeamName !== user.team.name) {
            user.team.name = newTeamName;
            alert("Team name updated!");
        }

        const newLeader = prompt("Enter a new team leader (username):", user.team.leader);
        if (newLeader && newLeader !== user.team.leader) {
            // Validate if the new leader is a valid user
            const newLeaderUser = users.find(u => u.codUsername === newLeader);
            if (newLeaderUser) {
                user.team.leader = newLeader;
                alert("Team leader updated!");
            } else {
                alert("Invalid username for team leader.");
            }
        }

        // Save the updated user data to localStorage
        localStorage.setItem("users", JSON.stringify(users));

        // Re-render the team
        renderTeam();
    } else {
        alert("You are not part of a team.");
    }
}

// Function to render the team details
function renderTeam() {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const teamDisplay = document.getElementById("team-display");
    const teamManagement = document.getElementById("team-management");
    const teamLeader = document.getElementById("team-leader");
    const teamPlayers = document.getElementById("team-players");

    if (currentUser) {
        const user = users.find(u => u.codUsername === currentUser);

        if (user && user.team) {
            teamDisplay.innerHTML = `<h2>Your Team: ${user.team.name}</h2>`;
            teamLeader.textContent = `Leader: ${user.team.leader}`;

            // Clear and populate players list
            teamPlayers.innerHTML = "";
            user.team.players.forEach((player, index) => {
                const li = document.createElement("li");
                li.textContent = player;

                // Add a remove button for each player
                const removeBtn = document.createElement("button");
                removeBtn.textContent = "Remove";
                removeBtn.addEventListener("click", () => removePlayerFromTeam(index));

                li.appendChild(removeBtn);
                teamPlayers.appendChild(li);
            });

            teamManagement.style.display = "block";
        } else {
            teamDisplay.innerHTML = "<p>You are not part of a team yet.</p>";
            teamManagement.style.display = "none";
        }
    }
}

// Function to add a player to the team
function addPlayerToTeam() {
    const newPlayerUsername = document.getElementById("new-player-username").value.trim();
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (newPlayerUsername === "") {
        alert("Player username cannot be empty.");
        return;
    }

    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        const userIndex = users.findIndex(u => u.codUsername === currentUser);
        if (userIndex > -1 && users[userIndex].team) {
            if (users[userIndex].team.players.includes(newPlayerUsername)) {
                alert(`${newPlayerUsername} is already in the team!`);
                return;
            }

            users[userIndex].team.players.push(newPlayerUsername);
            localStorage.setItem("users", JSON.stringify(users));

            alert(`${newPlayerUsername} added to the team!`);
            renderTeam();
        }
    }
}

// Function to remove a player from the team
function removePlayerFromTeam(playerIndex) {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (currentUser) {
        const userIndex = users.findIndex(u => u.codUsername === currentUser);
        if (userIndex > -1 && users[userIndex].team) {
            // Remove the player from the team
            const playerToRemove = users[userIndex].team.players[playerIndex];
            users[userIndex].team.players.splice(playerIndex, 1);
            localStorage.setItem("users", JSON.stringify(users));

            alert(`${playerToRemove} removed from the team!`);
            renderTeam(); // Re-render the team after removal
        }
    }
}

// Function to create a new team
function createTeam() {
    const teamName = document.getElementById("team-name").value.trim();
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (teamName === "") {
        alert("Team name cannot be empty.");
        return;
    }

    if (currentUser) {
        const userIndex = users.findIndex(u => u.codUsername === currentUser);

        if (userIndex > -1) {
            const user = users[userIndex];

            if (user.team) {
                alert("You are already part of a team.");
                return;
            }

            // Create new team
            user.team = {
                name: teamName,
                leader: currentUser,
                players: [currentUser]
            };

            localStorage.setItem("users", JSON.stringify(users));

            alert("Team created successfully!");
            renderTeam(); // Re-render the team after creation
        }
    }
}

// Function to post a match
function postMatch() {
    const user = users.find(u => u.codUsername === currentUser);

    if (!isTeamLeader()) {
        alert("Only team leaders can post matches.");
        return;
    }

    const matchType = document.getElementById("matchType").value; // 1v1, 2v2, 3v3, 4v4, 5v5
    const searchDestroy = document.getElementById("search-destroy").checked;
    const hardpoint = document.getElementById("hardpoint").checked;
    const control = document.getElementById("control").checked;
    const bestOf1 = document.getElementById("best-of-1").checked;
    const bestOf3 = document.getElementById("best-of-3").checked;

    const selectedGameModes = [];
    if (searchDestroy) selectedGameModes.push("Search & Destroy");
    if (hardpoint) selectedGameModes.push("Hardpoint");
    if (control) selectedGameModes.push("Control");

    const selectedMatchFormat = bestOf1 ? "Best of 1" : "Best of 3";
    const cdlRules = document.getElementById("cdl-rules").checked;

    if (!bestOf1 && !bestOf3) {
        alert("Please select Best of 1 or Best of 3.");
        return;
    }

    if (bestOf1 && selectedGameModes.length !== 1) {
        alert("When 'Best of 1' is selected, you must choose exactly one game mode.");
        return;
    }

    if (bestOf3 && selectedGameModes.length > 1) {
        alert("When 'Best of 3' is selected, you must choose one or no game mode.");
        return;
    }

    const newMatch = {
        matchType,
        postedBy: user.team.name,
        leader: user.team.leader,
        gameModes: selectedGameModes,
        matchFormat: selectedMatchFormat,
        maps: document.getElementById("maps").value.split(",").map(map => map.trim()),
        cdlRules,
        acceptedBy: null,
        reportedOutcome: {},
        result: null
    };

    let matches = JSON.parse(localStorage.getItem("matches")) || [];
    matches.push(newMatch);
    localStorage.setItem("matches", JSON.stringify(matches));

    alert("Match posted successfully!");
    renderMatches();
}

// Function to render matches
function renderMatches() {
    const matchList = document.getElementById("match-list");
    if (!matchList) {
        console.error("Match list element not found!");
        return;
    }
    matchList.innerHTML = "";

    let matches = JSON.parse(localStorage.getItem("matches")) || [];
    matches.forEach((match, index) => {
        const matchItem = document.createElement("div");
        matchItem.classList.add("match-item");

        matchItem.innerHTML = `
            <h3>Match Posted by: ${match.postedBy}</h3>
            <p>Leader: ${match.leader}</p>
            <p>Game Modes: ${match.gameModes.join(", ")}</p>
            <p>Match Format: ${match.matchFormat}</p>
            <p>Maps: ${match.maps.join(", ")}</p>
            <p>CDL Rules: ${match.cdlRules ? "Yes" : "No"}</p>
            <p>Match Type: ${match.matchType}</p>
        `;

        // If accepted
        if (match.acceptedBy) {
            matchItem.innerHTML += `
                <p><strong>Posted By:</strong> ${match.postedBy} (Leader: ${match.leader})</p>
                <p><strong>Maps:</strong> ${match.maps.join(", ")}</p>
            `;
        }

        // Team members
        if (match.acceptedBy) {
            const postedTeamMembers = getTeamMembers(match.postedBy);
            const acceptedTeamMembers = getTeamMembers(match.acceptedBy);

            matchItem.innerHTML += `
                <p><strong>Team Members (Posted By):</strong> ${postedTeamMembers}</p>
                <p><strong>Team Members (Accepted By):</strong> ${acceptedTeamMembers}</p>
                <p><strong>Accepted By:</strong> ${match.acceptedBy} (Leader: ${match.acceptedByLeader})</p>
            `;
        }

        if (!match.acceptedBy && match.leader !== currentUser) {
            matchItem.innerHTML += `<button onclick="acceptMatch(${index})">Accept Match</button>`;
        }

        if (match.leader === currentUser && !match.acceptedBy) {
            matchItem.innerHTML += `<button onclick="deleteMatch(${index})">Delete Match</button>`;
        }

        matchList.appendChild(matchItem);
    });
}

// Function to accept a match
function acceptMatch(index) {
    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.codUsername === currentUser);

    if (!user || !user.team) {
        alert("You must be in a team to accept matches.");
        return;
    }

    let matches = JSON.parse(localStorage.getItem("matches")) || []; // Load the matches from localStorage
    const match = matches[index];

    if (match.leader === currentUser) {
        alert("You cannot accept your own match.");
        return;
    }

    if (match.acceptedBy) {
        alert("This match has already been accepted.");
        return;
    }

    match.acceptedBy = user.team.name;
    match.acceptedByLeader = user.team.leader;
    localStorage.setItem("matches", JSON.stringify(matches)); // Save the updated matches back to localStorage
    renderMatches(); // Re-render the matches to reflect the changes

    alert("Match accepted!");
    renderMatches();
}

// Function to delete a match
function deleteMatch(matchIndex) {
    let matches = JSON.parse(localStorage.getItem("matches")) || [];
    matches.splice(matchIndex, 1);
    localStorage.setItem("matches", JSON.stringify(matches));

    alert("Match deleted.");
    renderMatches();
}

// Function to get team members by team name
function getTeamMembers(teamName) {
    const users = JSON.parse(localStorage.getItem("users")) || []; // Ensure users are loaded from localStorage
    const team = users.find(user => user.team?.name === teamName); // Find the team by its name

    return team && team.team.players.length > 0
        ? team.team.players.join(", ") // Return the players in the team
        : "No team found or no players in the team."; // Handle the case where no players are in the team
}

// Function to check if the current user is a team leader
function isTeamLeader() {
    const user = users.find(u => u.codUsername === currentUser);
    return user && user.team && user.team.leader === currentUser;
}
