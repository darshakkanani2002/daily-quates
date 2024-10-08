import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select';
import { Test_Api } from '../Config';
import axios from 'axios';
import { toast, ToastContainer, } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteModal from '../modal/DeleteModal';

export default function Category() {
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [category, setCategory] = useState([]);
    const [categoryData, setCategoryData] = useState({
        vName: '',
        iCatFontSize: '',
        // iChipVspace: '',
        vIcon: '',
        vlanguageId: '',
        iCatLine: ''
    })

    const [options, setOptions] = useState([]);
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [deleteID, setDeleteId] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentId, setCurrentId] = useState(null)


    useEffect(() => {
        loadOptions();
    }, [])

    const fetchData = (vlanguageId) => {
        axios.post(`${Test_Api}category/list`, { vlanguageId }).then(response => {
            console.log("category Data ==>", response.data.data);
            setCategory(response.data.data);

        }).catch(error => {
            console.log(error);

        })
    }

    // -------------------------------------------------- Load Category Option------------------------
    const loadOptions = async () => {
        try {
            const response = await axios.get(`${Test_Api}language/details`);
            const data = response.data.data.map(language => ({
                label: language.vName,
                value: language._id,
                id: language._id
            }));
            setOptions(data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    // Language select handle ---------------------------
    const handleCategorySelect = (selectedOption) => {
        setSelectedLanguage(selectedOption);
        setCategoryData(prevState => ({
            ...prevState,
            vlanguageId: selectedOption ? selectedOption.id : ''
        }));
        if (selectedOption) {
            fetchData(selectedOption.id);
            console.log("Selected Options ===>", selectedOption);

        }
    };

    // handle File change -----------------------------------------------------------------
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCategoryData({ ...categoryData, vIcon: file });
        setPreview(URL.createObjectURL(file)); // Set the preview URL
    };

    // Category data save api --------------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        const languageId = categoryData.vlanguageId || selectedLanguage?.id;

        formData.append('vName', categoryData.vName);
        formData.append('iCatFontSize', categoryData.iCatFontSize);
        formData.append('iCatLine', categoryData.iCatLine);
        formData.append('vlanguageId', languageId);

        // Append the file only if it's a new file
        if (categoryData.vIcon instanceof File) {
            formData.append('vIcon', categoryData.vIcon);
        }

        if (isUpdating) {
            formData.append('vCatId', currentId);
            axios.put(`${Test_Api}category/details`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(response => {
                console.log("category Updated Data ==>", response.data);
                fetchData(languageId);
                toast.success("Category updated successfully!");
                resetForm();
            }).catch(error => {
                console.log(error);
            });
        } else {
            axios.post(`${Test_Api}category/details`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then(response => {
                console.log("Category Saved Data ==>", response.data);
                setCategoryData({
                    vName: '',
                    iCatFontSize: '',
                    vlanguageId: '',
                    iCatLine: ''
                });
                fetchData(languageId);
                toast.success("Category created successfully!");
                resetForm();
            }).catch(error => {
                console.log(error);
            });
        }
    };


    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     const languageId = categoryData.vlanguageId || selectedLanguage?.id;
    //     if (isUpdating) {
    //         const updateData = {
    //             vCatId: currentId,
    //             vName: categoryData.vName,
    //             iCatFontSize: categoryData.iCatFontSize,
    //             vlanguageId: languageId
    //         }
    //         console.log("Updated Category Data ==> ", updateData)

    //         axios.put(`${Test_Api}category/details`, updateData).then(response => {
    //             console.log("category Updated Data ==>", response.data);
    //             fetchData(languageId);
    //             toast.success("Catagory Updated successfully!")
    //             setCategoryData({
    //                 vName: '',
    //                 iCatFontSize: '',
    //                 vlanguageId: ''
    //             })
    //         }).catch(error => {
    //             console.log(error);

    //         })
    //     } else {
    //         const newCategoryData = { ...categoryData, vlanguageId: languageId };
    //         axios.post(`${Test_Api}category/details`, newCategoryData).then(response => {
    //             console.log("category Save Data ==>", response.data);
    //             // setCategory(prevCategory => [response.data.data, ...prevCategory]);
    //             setCategoryData({
    //                 vName: '',
    //                 iCatFontSize: '',
    //                 vlanguageId: ''
    //             });
    //             fetchData(languageId);
    //             toast.success("Catagory created successfully!")

    //         }).catch(error => {
    //             console.log(error);

    //         })

    //     }

    // }

    // Handel Update Data ----------------------------------------------------


    const handleUpdate = (category) => {
        setCategoryData({
            _id: category._id,
            vName: category.vName,
            iCatFontSize: category.iCatFontSize,
            iCatLine: category.iCatLine,
            vlanguageId: category.vlanguageId,
            vIcon: category.vIcon
        });
        setIsUpdating(true);
        setCurrentId(category._id);
        setPreview(`http://192.168.1.3:4500/${category.vIcon}`)
    };

    // Delete category data api ----------------------------------------
    const handleDelete = () => {
        axios.delete(`${Test_Api}category/details`, {
            data: { vCatId: deleteID }
        }).then(response => {
            console.log("Deleted Category Data ==>", response.data);
            fetchData(categoryData.vlanguageId);
            toast.warning('Language deleted successfully!');
        }).catch(error => {
            console.log(error);

        })
    }

    // Function to reset the form and clear the file input
    const resetForm = () => {
        setCategoryData({
            vName: '',
            iCatFontSize: '',
            iChipVspace: '', // Reset iChipVspace as well
            vIcon: null,
            vlanguageId: '',
            iCatLine: ''
        });
        setPreview(null); // Remove the image preview
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the file input field
        }
    };
    return (
        <div>
            {/* Form Data  */}

            <div className='py-3'>
                <ToastContainer
                    position="top-center"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    transition:Bounce
                />
                <div className='side-container category-form p-3'>
                    <form onSubmit={handleSubmit}>
                        <div className='row'>
                            <div className='col-lg-12'>
                                <Select className='mb-3'
                                    value={selectedLanguage}
                                    onChange={handleCategorySelect}
                                    onMenuOpen={loadOptions}
                                    options={options}
                                ></Select>
                            </div>
                            <div className='col-lg-3'>
                                <label>Name</label>
                                <input value={categoryData.vName} type="text" name="name" id="name" className='form-control mb-3' onChange={(e) => setCategoryData({ ...categoryData, vName: e.target.value })} />
                            </div>
                            <div className='col-lg-3'>
                                <label htmlFor="fontsize">iCatFontSize</label>
                                <input value={categoryData.iCatFontSize} type="text" name="fontsize" id="fontsize" className='form-control mb-3' onChange={(e) => setCategoryData({ ...categoryData, iCatFontSize: e.target.value })} />
                            </div>
                            <div className='col-lg-3'>
                                <label htmlFor="vspace">iChipVspace</label>
                                <input type="text" name="vspace" id="vspace" className='form-control mb-3' onChange={(e) => setCategoryData({ ...categoryData, iChipVspace: e.target.value })} />
                            </div>
                            <div className='col-lg-3'>
                                <label htmlFor="vspace">iCatLine</label>
                                <input value={categoryData.iCatLine} type="text" name="vspace" id="vspace" className='form-control mb-3' onChange={(e) => setCategoryData({ ...categoryData, iCatLine: e.target.value })} />
                            </div>
                            <div className='col-lg-12'>
                                <label htmlFor="icon">Icon</label>
                                <input type="file" name="file" id="icon" className='form-control mb-3'
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                                {preview && <img crossOrigin="anonymous" src={preview} alt="Preview" className='img-fluid mt-2 category-select-icon' />}
                            </div>

                            <div className='col-lg-12 text-center'>
                                <button type='submit' className='btn btn-success'>Submit</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className='side-container my-5'>
                    <div>
                        <table className='table text-center'>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>iCatFontSize</th>
                                    <th>iCatLine</th>
                                    <th>iChipVspace</th>
                                    <th>icon</th>
                                    <th>Delete/Updatae</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category.length > 0 ? (
                                    category.map((item, id) => (
                                        <tr key={id}>
                                            <td>{id + 1}</td>
                                            <td>{item.vName}</td>
                                            <td>{item.iCatFontSize}</td>
                                            <td>{item.iCatLine}</td>
                                            <td>{item.iChipVspace}</td>
                                            <td><img crossOrigin="anonymous" src={`http://192.168.1.3:4500/${item.vIcon}`} alt="" className='category-icon' /></td>
                                            <td>
                                                <button className='btn btn-danger mx-2' onClick={() => setDeleteId(item._id)} data-bs-toggle="modal" data-bs-target="#deleteModal">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                                <button className='btn btn-success mx-2' onClick={() => handleUpdate(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className='text-center'>
                                        <td colSpan="7" className='py-3'>
                                            <img src="/images/no-data-icon.png" alt="" className='img-fluid table-no-data-img' />
                                            <span className='table-data-not-found-text mt-1 d-block'>Data Not Found !</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Modal */}
                <DeleteModal deleteID={deleteID} handleDelete={handleDelete}></DeleteModal>
            </div>
        </div>
    )
}
