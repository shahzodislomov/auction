import { getStorageItem } from "@/utils/storage";
import MySwal from "sweetalert2";
import { useSetNotify } from "@/queries/search";
import { FormattedMessage, useIntl } from "react-intl";

const NoResults = ({ searchingKey }) => {
    const { mutate: setNotify } = useSetNotify();
    const userId = getStorageItem('userId') || null;
    const intl = useIntl();

    const handleNotifyMe = async () => {
        if (!userId) {
            MySwal.fire({
                icon: "warning",
                title: intl.formatMessage({ id: 'youneedtologin' }),
                confirmButtonText: "OK",
            });
            return;
        }

        const result = await MySwal.fire({
            title: intl.formatMessage({ id: "notifyskey" }, { searchingKey }),
            text: intl.formatMessage({ id: 'notifyskeytext' }),
            icon: "question",
            showCancelButton: true,
            confirmButtonText: intl.formatMessage({ id: 'yes' }),
            cancelButtonText: intl.formatMessage({ id: 'no' }),
        });

        if (result.isConfirmed) {
            setNotify(
                { searchKey: searchingKey, userId },
                {
                    onSuccess: () => {
                        MySwal.fire({
                            icon: "success",
                            title: intl.formatMessage({ id: 'success' }),
                            confirmButtonText: "OK",
                        });
                    },
                    onError: () => {
                        MySwal.fire({
                            icon: "error",
                            title: intl.formatMessage({ id: 'error' }),
                            confirmButtonText: "OK",
                        });
                    },
                }
            );
        }

    };

    return (
        <div className="text-center space-y-4 py-6">
            <p className="text-red-500 text-lg">
                <FormattedMessage id="no_results" values={{ searchingKey }} />
            </p>
            <button
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                onClick={handleNotifyMe}
            >
                <FormattedMessage id="notifywhenav" />
            </button>
        </div>
    );
};

export default NoResults;
