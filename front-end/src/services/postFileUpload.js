export async function postFileUpload(uploadFormData, uploadType, user) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/file_upload', {
        method: 'POST', 
        headers: {
            'Authorization': "Token " + user.token,
            'UploadType': uploadType
        },
        body: uploadFormData
    });
    return await response;
}