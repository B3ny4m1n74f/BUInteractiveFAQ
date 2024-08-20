document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired");

    // Retrieve the user token from localStorage
    let token = localStorage.getItem('token'); // Get the token from localStorage

    if (!token) {
        console.error('No token found. Cannot proceed without authentication.');
        alert('Error: No token found. You will be redirected to the login page.');
        window.location.href = '/login'; // Redirect to the login page if no token is found
        return;
    }

    try {
        const response = await fetch('/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            // Populate form fields with user data
            document.getElementById('username').value = user.username;
            document.getElementById('firstname').value = user.first_name;
            document.getElementById('lastname').value = user.last_name;
            document.getElementById('email').value = user.email;
            document.getElementById('nickname').value = user.nickname || '';
            document.getElementById('website').value = user.website || '';
            document.getElementById('telephone').value = user.telephone || '';
            document.getElementById('mobile').value = user.mobile || '';
            document.getElementById('bioinfo').value = user.bio || '';

            // If a profile image exists, set the img.src to display it
            if (user.profile_image) {
                const profileImageElement = document.querySelector('.profile-image');
                profileImageElement.src = `/uploads/${user.profile_image}`;
            }
        } else {
            console.error('Failed to retrieve user data:', await response.json());
            alert('Failed to load user profile. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('An error occurred while loading the profile.');
    }

    // Handle saving updated user information
    const saveProfileForm = document.querySelector('.info-form');

    if (saveProfileForm) {
        saveProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const firstname = document.getElementById('firstname').value;
            const lastname = document.getElementById('lastname').value;
            const email = document.getElementById('email').value;
            const nickname = document.getElementById('nickname').value || '';
            const website = document.getElementById('website').value || '';
            const telephone = document.getElementById('telephone').value || '';
            const mobile = document.getElementById('mobile').value || '';
            const bio = document.getElementById('bioinfo').value || '';
            const profile_image = document.getElementById('profilephoto').files[0];

            const formData = new FormData();
            formData.append('username', username);
            formData.append('firstname', firstname);
            formData.append('lastname', lastname);
            formData.append('email', email);
            formData.append('nickname', nickname);
            formData.append('website', website);
            formData.append('telephone', telephone);
            formData.append('mobile', mobile);
            formData.append('bio', bio);
            if (profile_image) {
                formData.append('profile_image', profile_image);
            }

            try {
                const response = await fetch('/auth/update-profile', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Use the token retrieved earlier
                    },
                    body: formData
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Profile updated successfully');
                    window.location.reload();
                } else {
                    alert('Profile update failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('An error occurred while updating the profile.');
            }
        });
    }
});
