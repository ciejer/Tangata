export async function refreshMetadata(user) {
    console.log(user);
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/refresh_metadata', {
        method: 'POST', 
        headers: {
                Authorization: "Token " + user.token
            }
    });
    return await response.json();
}