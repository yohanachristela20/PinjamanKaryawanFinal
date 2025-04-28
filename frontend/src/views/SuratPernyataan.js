import React, { useState, useEffect } from "react";
import AcceptedAlert from "components/Alert/AcceptedAlert.js";
import DeclineAlert from "components/Alert/DeclineAlert.js";
import ConditionallyAccepted from "components/Alert/ConditionallyAccepted";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaCheckCircle, FaTimesCircle, FaHistory} from 'react-icons/fa'; 
import { useHistory } from "react-router-dom";

import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// import PDFViewer from "./pdfViewer.js";

const BASE_URL = 'http://10.70.10.124:5000';

export const fetchHistoryPinjaman = async (idPeminjam) => {
  return axios.get(`${BASE_URL}/history-pinjaman/${idPeminjam}`, {
    headers: {
      Authorization: `Bearer ${token}`,
  },
  });
};

import {
  Badge,
  Button,
  Card,
  Form,
  Navbar,
  Nav,
  Container,
  Row,
  Col, 
  Table
} from "react-bootstrap";

function SuratPernyataan() {
  const location = useLocation();
  const [selectedPinjaman, setSelectedPinjaman] = useState(
    location?.state?.selectedPinjaman || null
  );
  const [keperluan, setKeperluan] = useState(''); 
  const [jumlah_pinjaman, setJumlahPinjaman] = useState(0);
  const [totalSudahDibayar, setTotalSudahDibayar] = useState(0);  
  const [belumDibayar, setBelumDibayar] = useState(0);  
  const [pinjaman, setPinjaman] = useState([]); 
  const [totalPinjaman, setTotalPinjaman] = useState(0); 
  const [totalPinjamanKeseluruhan, setTotalPinjamanKeseluruhan] = useState(0); 
  const [jumlahPlafondSaatIni, setPlafondSaatIni] = useState(0);

  const [id_pinjaman, setIdPinjaman] = useState(0);
  const [plafond, setPlafond] = useState([]); 
  const [selectedPlafond, setSelectedPlafond] = useState(null); 
  const [plafondTersedia, setPlafondTersedia] = useState(null);
  const plafondTersediaNumber = parseFloat(plafondTersedia);
  const jumlahPinjamanNumber = parseFloat(selectedPinjaman?.jumlah_pinjaman);
  const [isDeclined, setIsDeclined] = useState(false);
  const history = useHistory();
  const [screeningResult, setScreeningResult] = useState(null);
  const [rasio_angsuran] = useState(0);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hidden, setHidden] = useState(false); 

  const [filepath_pernyataan, setFilePathPernyataan] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(`http://10.70.10.124:5000/pdf/${selectedPinjaman?.id_pinjaman}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('File tidak ditemukan atau gagal diambil');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error fetching pdf data:", error);
      }
    };

    if (selectedPinjaman?.id_pinjaman) {
      fetchPdf();
    }
  }, [selectedPinjaman?.id_pinjaman]);


  useEffect(() => {
    const loadScreeningData = () => {
      const savedScreening = localStorage.getItem("hasilScreening"); 
      if (savedScreening) {
        const parsedData = JSON.parse(savedScreening);
        setTotalSudahDibayar(parsedData.totalSudahDibayar || 0);
        setTotalPinjaman(parsedData.totalPinjaman || 0);
        setPlafondTersedia(parsedData.jumlahPlafondSaatIni || 0);
        setScreeningResult(parsedData); 
      }
    }

    const fetchData = async () => {
      if (!token) {
        console.error("Token tidak tersedia");
        return;
      }
      try {
        const [
          responseTotalSudahDibayar,
          responseTotalPinjaman,
          responseTotalJumlahPinjaman,
          responsePlafond,
        ] = await Promise.all([
          axios.get(`http://10.70.10.124:5000/angsuran/total-sudah-dibayar/${selectedPinjaman?.id_peminjam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
          },
          }),
          axios.get(`http://10.70.10.124:5000/pinjaman/total-pinjaman/${selectedPinjaman?.id_peminjam}`, {
            headers: {
              Authorization: `Bearer ${token}`,
          },
          }),
          axios.get("http://10.70.10.124:5000/total-pinjaman-keseluruhan", {
             headers: {
              Authorization: `Bearer ${token}`,
          },
          }),
          await axios.get(
          `http://10.70.10.124:5000/plafond-update-saat-ini/${selectedPinjaman.id_pinjaman}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          // axios.get("http://10.70.10.124:5000/plafond-tersedia", {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          // },
          // }),
        ]);
  
        const totalSudahDibayar = responseTotalSudahDibayar.data.total_sudah_dibayar || 0;
        setTotalSudahDibayar(totalSudahDibayar);
  
        const totalPinjaman = responseTotalPinjaman.data.total_pinjaman || 0;
        setTotalPinjaman(totalPinjaman);
  
        const totalPinjamanKeseluruhan = responseTotalJumlahPinjaman.data.totalPinjamanKeseluruhan || 0;
        setTotalPinjamanKeseluruhan(totalPinjamanKeseluruhan);
  
        // const plafondTersedia = responsePlafond.data.plafondTersedia || 0;
        // setPlafondTersedia(plafondTersedia);
        // console.log("Plafond tersedia:", plafondTersedia);

        const jumlahPlafondSaatIni = responsePlafond.data?.plafondSaatIni || 0;
        setPlafondSaatIni(jumlahPlafondSaatIni);
        
        const hasilScreening = {
          totalSudahDibayar,
          totalPinjaman,
          jumlahPlafondSaatIni,
          // plafondTersedia,
          // totalPinjamanKeseluruhan, 
          idPeminjam: selectedPinjaman?.id_peminjam, 
        }; 
        localStorage.setItem("hasilScreening", JSON.stringify(hasilScreening)); 
        setScreeningResult(hasilScreening); 
        // console.log("Plafond TERSEDIA: ", plafondTersedia);
        // console.log("Plafond saat ini: ", jumlahPlafondSaatIni);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    if (!selectedPinjaman) {
      const savedPinjaman = localStorage.getItem("selectedPinjaman");
      if (savedPinjaman) {
        setSelectedPinjaman(JSON.parse(savedPinjaman));
      }
    } else {
      // Simpan `selectedPinjaman` ke `localStorage` untuk digunakan ulang
      localStorage.setItem("selectedPinjaman", JSON.stringify(selectedPinjaman));
    }
    // } else {
    //   loadScreeningData();
    // }

    if (selectedPinjaman?.id_peminjam) {
      fetchData();
    } else {
      loadScreeningData();
    }

    // loadScreeningData();
  }, [selectedPinjaman, token]);

  // {jumlahPlafondSaatIni !== null && (
  //   <p>Masih ada plafond tersisa: {jumlahPlafondSaatIni}</p>
  // )}
  // {screeningResult && (
  //   <p>Hasil Screening: {screeningResult.jumlahPlafondSaatIni >= 0 ? "Diterima" : "Ditolak"}</p>
  // )}

  useEffect(() => {
    try {
      const fetchPdf = async() => {
        fetch(`http://10.70.10.124:5000/pdf/${selectedPinjaman?.id_pinjaman}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        });
      }

      if (selectedPinjaman?.id_pinjaman) {
        fetchPdf();
      } else {
        loadScreeningData();
      }

    } catch (error) {
      console.error("Error fetching pdf data:", error);
    }
  }, [selectedPinjaman?.id_pinjaman]);

  const updatePinjamanStatus = (status) => {
    axios.put(`http://10.70.10.124:5000/pinjaman/cancel/${selectedPinjaman.id_pinjaman}`, {
      not_compliant: status, 
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
    },
    })
    .then(response => {
      console.log('Pinjaman status updated:', response.data);
    })
    .catch(error => {
      console.error('Error updating pinjaman status:', error);
    });
  }
  

  const getPlafond = async () =>{
    try {
      const response = await axios.get("http://10.70.10.124:5000/plafond");
      setPlafond(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };
  
  const getPinjaman = async () =>{
    try {
      const response = await axios.get("http://10.70.10.124:5000/pinjaman");
      setPinjaman(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const formatRupiah = (angka) => {
    let gajiString = angka.toString().replace(".00");
    let sisa = gajiString.length % 3;
    let rupiah = gajiString.substr(0, sisa);
    let ribuan = gajiString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const calculateYearsAndMonth = (tanggalMasuk) => {
    const currentDate = new Date();
    const startDate = new Date(tanggalMasuk); 

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth(); 

    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return `${years} Tahun ${months} Bulan`; 
  }; 

  const calculateYears = (tanggalMasuk) => {
    const currentDate = new Date(); 
    const startDate = new Date(tanggalMasuk); 

    let years = currentDate.getFullYear() - startDate.getFullYear();

    return `${years}`; 
  }

  const calculatePensiun = (tanggalMasuk, jenisKelamin) => {
    const currentYear = new Date().getFullYear(); 
    const startYear = new Date(tanggalMasuk).getFullYear(); 

    let tahunPensiun;

    if (jenisKelamin === "L") {
      tahunPensiun = 60;
    } else if (jenisKelamin === "P") {
      tahunPensiun = 55; 
    }

    const tahunPensiunSeharusnya = startYear + tahunPensiun; 
    const jarakPensiun = tahunPensiunSeharusnya - currentYear;
 
    return `${jarakPensiun}`; 
  }


  const calculaterasio_angsuran = (jumlahPinjaman, gajiPokok) => {
    if (!jumlahPinjaman || !gajiPokok) return 0; 
  
    // console.log("Jumlah pinjaman: ", jumlahPinjaman);
    // console.log("Gaji pokok: ", gajiPokok);
  
    const angsuranBulanan = jumlahPinjaman / 60;
    // const rasio_angsuran = (angsuranBulanan / gajiPokok) * 10;
    const rasio_angsuran = (angsuranBulanan/(gajiPokok*1) * 100)
  
    // console.log("Angsuran bulanan: ", angsuranBulanan);
    // console.log("Rasio angsuran (persentase): ", rasio_angsuran);
  
    return parseFloat(rasio_angsuran.toFixed(2)); 

    // console.log(
    //   "Rasio angsuran:",
    //   calculaterasio_angsuran(selectedPinjaman.jumlah_pinjaman, selectedPinjaman.Peminjam.gaji_pokok)
    // );
  };
  

  const totalBelumDibayar =
  selectedPinjaman &&
  selectedPinjaman.BelumDibayar &&
  selectedPinjaman.BelumDibayar.length > 0
    ? Object.values(
        selectedPinjaman.BelumDibayar.filter(
          (angsuran) => angsuran.belum_dibayar >= 0 // Pastikan hanya proses data valid
        ).reduce((grouped, angsuran) => {
          // Kelompokkan berdasarkan id_pinjaman
          if (!grouped[angsuran.id_pinjaman]) {
            grouped[angsuran.id_pinjaman] = [];
          }
          grouped[angsuran.id_pinjaman].push(angsuran);
          return grouped;
        }, {})
      )
        .map((pinjamanAngsuran) => {
          // Ambil angsuran terakhir berdasarkan id_angsuran (lexicographical order)
          const angsuranTerakhir = pinjamanAngsuran.reduce(
            (latest, current) =>
              current.id_angsuran > latest.id_angsuran ? current : latest
          );
          // console.log(
          //   `ID Pinjaman: ${angsuranTerakhir.id_pinjaman}, ID Angsuran Terakhir: ${angsuranTerakhir.id_angsuran}, Belum Dibayar: ${angsuranTerakhir.belum_dibayar}`
          // );
          return angsuranTerakhir.belum_dibayar; // Ambil hanya nilai belum_dibayar
        })
        .reduce((total, belumDibayar) => total + parseFloat(belumDibayar || 0), 0) // Jumlahkan
    : 0;

console.log("Total belum dibayar:", totalBelumDibayar);

function onDocumentLoadSuccess({ numPages }) {
  setNumPages(numPages);
}

  return (
    <>
    {/* <div>
      <h1>Screening Karyawan</h1>
      {screeningResult && (
        <div>
          <p>Total Sudah Dibayar: {screeningResult.totalSudahDibayar}</p>
          <p>Total Pinjaman: {screeningResult.totalPinjaman}</p>
          <p>Total Pinjaman Keseluruhan: {screeningResult.totalPinjamanKeseluruhan}</p>
          <p>Plafond Tersedia: {screeningResult.plafondTersedia}</p>
        </div>
      )}
    </div> */}
      <Container fluid>
          <Row>
          <Col className="card-screening" style={{ maxWidth: "100%" }}>
          <Card className="card-screening p-4">
            {selectedPinjaman?.jumlah_pinjaman && selectedPinjaman?.Peminjam.gaji_pokok ? (
              calculaterasio_angsuran(
                selectedPinjaman.jumlah_pinjaman,
                selectedPinjaman.Peminjam.gaji_pokok
              ) > 20 ? (
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="700px"
                  title="PDF Preview"
                />
              ) : (
                hidden
              )
            ) : (
              hidden
            )}
          </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SuratPernyataan;