import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Container, Alert } from 'react-bootstrap';
import { getToken } from '../../store/utlits'; // 确保路径正确
import swal from 'sweetalert';

const TestDashboard = () => {
    const user = useSelector(state => state.session.user);

    const handleReset = async () => {
        const confirm = await swal({
            title: "Are you sure?",
            text: "This will permanently delete all pages and homepage settings for your current restaurant. This action cannot be undone.",
            icon: "warning",
            buttons: ["Cancel", "Yes, reset it!"],
            dangerMode: true,
        });

        if (!confirm) {
            return;
        }

        try {
            const token = getToken();
            const response = await fetch('/api/admin-guanli/reset-website', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset data.');
            }

            await swal("Success!", "Website data has been reset. The page will now reload.", "success");
            window.location.reload();

        } catch (err) {
            swal("Error!", err.message, "error");
        }
    };

    if (!user) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">Please log in to use the test dashboard.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5 p-4 bg-light rounded">
            <h2 className="mb-4">🧪 Test Control Panel</h2>
            <p>Use this panel to perform test actions. Be careful, these actions can be destructive.</p>
            <hr />
            <div className="mt-4">
                <h4>Reset Website Data</h4>
                <p className="text-muted">
                    This will delete all pages, sections, and homepage settings for your currently logged-in restaurant.
                    It allows you to restart the "AI Website Builder" process from the beginning.
                </p>
                <Button variant="danger" onClick={handleReset}>
                    Reset My Website Data
                </Button>
            </div>
        </Container>
    );
};

export default TestDashboard;
