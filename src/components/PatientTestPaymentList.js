import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './PatientTestPaymentList.css'; // Create this file for styling

const PatientTestPaymentList = () => {
    const [combinedData, setCombinedData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, testsRes, financesRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/patients`),
                    axios.get(`${process.env.REACT_APP_API_URL}/tests`),
                    axios.get(`${process.env.REACT_APP_API_URL}/finance`)
                ]);

                const patients = patientsRes.data;
                const tests = testsRes.data;
                const finances = financesRes.data;

                // This is a simplified combination logic. You might need a more sophisticated approach.
                const data = tests.map(test => {
                    const patient = patients.find(p => p._id === test.patientId);
                    const payment = finances.find(f => f.testId === test._id);

                    return {
                        patientName: patient ? patient.name : 'N/A',
                        testName: test.testName, // Assuming testName exists on the test object
                        testDate: new Date(test.date).toLocaleDateString(),
                        reportStatus: 'N/A', // You'll need to fetch and link reports data
                        paymentStatus: payment ? 'Paid' : 'Unpaid',
                        amount: test.price,
                        testId: test._id
                    };
                });

                setCombinedData(data);
            } catch (error) {
                console.error("Error fetching combined data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="patient-test-payment-list">
            <h1>Patient Test & Payment List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Patient Name</th>
                        <th>Test Name</th>
                        <th>Test Date</th>
                        <th>Report Status</th>
                        <th>Payment Status</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {combinedData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.patientName}</td>
                            <td>{item.testName}</td>
                            <td>{item.testDate}</td>
                            <td>{item.reportStatus}</td>
                            <td className={item.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}>{item.paymentStatus}</td>
                            <td>${item.amount}</td>
                            <td><button>View</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PatientTestPaymentList;
