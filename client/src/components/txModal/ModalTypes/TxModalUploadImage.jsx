import { useTransactionsController } from "../../../providers/TransactionsProvider";
import TxModalHeader from "../components/TxModalHeader";

const TxModalUploadImage = ({handleImageChange}) => {

    const {
        setIsModalOpen,
        setModalType
    } = useTransactionsController()

    return (
        <>
            {/* Close button */}
            <TxModalHeader title={'Upload Rules'} disableSimpleClose={true} />

            {/* Modal Body */}
            <div className="modal-body">
                <div className="tracker-container d-flex flex-column" style={{ fontSize: '1rem' }}>
                    <div className='text-center'>Increase chances to turn concept into store NFT by following rules below!</div>
                    <ul>
                        <li>512px by 512px or less</li>
                        <li>Square</li>
                        <li>SFW (Safe for Work)</li>
                        <li>Transparent background</li>
                        <li>.jpg | .png | .svg </li>
                    </ul>
                </div>

                {/* Image Upload */}
                <div style={{ marginTop: "15px" }}>
                    <label htmlFor="image" style={{ display: "block", marginBottom: "5px" }}>
                        Upload Image:
                    </label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "4px",
                            border: "1px solid #555",
                            backgroundColor: "#2E2E2E",
                            color: "#FFF",
                        }}
                    />
                </div>
            </div>

            {/* Upload Button */}
            <div className="d-flex justify-content-center">
                <button
                    className="button-style-regular"
                    onClick={() => { setIsModalOpen(false), setModalType('') }}
                // disabled={!selectedImage || txState === "started"}
                >
                    Done
                </button>
            </div>
        </>
    );
};

export default TxModalUploadImage;