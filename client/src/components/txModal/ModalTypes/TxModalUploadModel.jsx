import { useTransactionsController } from "../../../providers/TransactionsProvider";
import TxModalHeader from "../components/TxModalHeader";

const TxModalUploadModel = ({handleModelUpload}) => {

    const { setIsModalOpen, setModalType } = useTransactionsController()

    return (
        <>
            {/* Close button */}
            <TxModalHeader title={"Model Upload Rules"} disableSimpleClose={true} />

            {/* Modal Body */}
            <div className="modal-body">
                <div className="tracker-container d-flex flex-column" style={{ fontSize: "1rem" }}>
                    <div className="text-center">
                        Add a 3D model so marketplaces can render your NFT in 3D.
                    </div>
                    <ul>
                        <li>.glb format (glTF binary)</li>
                        <li>Keep file size small (optimize textures/meshes)</li>
                        <li>Single mesh/materials preferred for performance</li>
                        <li>Use PBR textures if included (baseColor/metallicRoughness/normal)</li>
                        <li>Optional: Draco/KTX2 compression if supported</li>
                    </ul>
                </div>

                {/* Model Upload */}
                <div style={{ marginTop: "15px" }}>
                    <label htmlFor="model" style={{ display: "block", marginBottom: "5px" }}>
                        Upload 3D Model (.glb):
                    </label>
                    <input
                        type="file"
                        id="model"
                        accept=".glb,model/gltf-binary"
                        onChange={handleModelUpload}
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
                    onClick={() => {
                        setIsModalOpen(false);
                        setModalType("");
                    }}
                >
                    Done
                </button>
            </div>
        </>
    );
};

export default TxModalUploadModel;
