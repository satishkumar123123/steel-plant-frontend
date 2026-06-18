import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function UnsafeClosed(){

  const navigate = useNavigate();

  const [data,setData] = useState([]);
  const [editMode,setEditMode] = useState(false);
  const [history,setHistory] = useState([]);

  /* LOAD DATA */
  useEffect(()=>{

    fetch(`${API}/safety-filter?indicatorType=Leading&category=Unsafe Closed`)
    .then(res=>res.json())
    .then(result=>setData(result));

  },[]);

  /* LOAD HISTORY */
  useEffect(()=>{

    fetch(`${API}/safety-history`)
    .then(res=>res.json())
    .then(data=>setHistory(data));

  },[]);

  /* HANDLE CHANGE */
  const handleChange = (index,field,value)=>{

    const updated = [...data];
    updated[index][field] = value;
    setData(updated);

  };

  /* SAVE */
  const handleSave = async(id,updatedData)=>{

    await fetch(`${API}/safety/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(updatedData)
    });

    alert("Safety updated successfully ✅");

    setEditMode(false);

  };

  return(

    <div style={{
      padding:"40px",
      minHeight:"100vh",
      background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)"
    }}>

      <button
        onClick={()=>navigate("/safety/leading")}
        style={{
          background:"linear-gradient(45deg,#ff512f,#dd2476)",
          border:"none",
          padding:"10px 16px",
          color:"#fff",
          borderRadius:"8px",
          cursor:"pointer",
          fontWeight:"bold",
          boxShadow:"0 4px 10px rgba(0,0,0,0.3)"
        }}
      >
        ⬅ Back
      </button>

      <h2 style={{
        marginTop:"20px",
        color:"#ffffff",
        letterSpacing:"1px"
      }}>
        Unsafe Act / Condition Closed
      </h2>

      {!editMode && (

        <button
          onClick={()=>setEditMode(true)}
          style={{
            marginTop:"10px",
            background:"linear-gradient(45deg,#f7971e,#ffd200)",
            border:"none",
            padding:"10px 16px",
            color:"#000",
            borderRadius:"8px",
            cursor:"pointer",
            fontWeight:"bold",
            boxShadow:"0 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          ✏ Edit
        </button>

      )}

      <table
        border="1"
        cellPadding="10"
        style={{
          marginTop:"25px",
          background:"#ffffff",
          borderRadius:"12px",
          overflow:"hidden",
          borderCollapse:"collapse",
          boxShadow:"0 15px 35px rgba(0,0,0,0.3)"
        }}
      >

        <thead style={{
          background:"linear-gradient(45deg,#00c6ff,#0072ff)",
          color:"#fff"
        }}>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Description</th>
            <th>Closed By</th>
            {editMode && <th>Action</th>}
          </tr>
        </thead>

        <tbody>

          {data.map((item,index)=>(

            <tr
              key={item._id}
              style={{
                background:index%2===0 ? "#e3f2fd" : "#ffffff"
              }}
            >

              <td>
                {editMode ? (
                  <input
                    value={item.date}
                    onChange={(e)=>handleChange(index,"date",e.target.value)}
                  />
                ) : item.date}
              </td>

              <td>
                {editMode ? (
                  <input
                    value={item.location}
                    onChange={(e)=>handleChange(index,"location",e.target.value)}
                  />
                ) : item.location}
              </td>

              <td>
                {editMode ? (
                  <input
                    value={item.description}
                    onChange={(e)=>handleChange(index,"description",e.target.value)}
                  />
                ) : item.description}
              </td>

              <td>
                {editMode ? (
                  <input
                    value={item.closedBy}
                    onChange={(e)=>handleChange(index,"closedBy",e.target.value)}
                  />
                ) : item.closedBy}
              </td>

              {editMode && (

                <td>

                  <button
                    onClick={()=>handleSave(item._id,item)}
                    style={{
                      background:"#4caf50",
                      border:"none",
                      padding:"6px 10px",
                      color:"#fff",
                      borderRadius:"5px",
                      cursor:"pointer"
                    }}
                  >
                    💾 Save
                  </button>

                </td>

              )}

            </tr>

          ))}

        </tbody>

      </table>


      {/* HISTORY SECTION */}

      <h2 style={{
        marginTop:"50px",
        color:"#ffffff"
      }}>
        Safety Update History
      </h2>

      {history
        .filter(h => h.category === "Unsafe Closed")
        .map(h=>(

        <div
          key={h._id}
          style={{
            background:"linear-gradient(135deg,#667eea,#764ba2)",
            padding:"22px",
            marginTop:"15px",
            borderRadius:"14px",
            color:"#fff",
            boxShadow:"0 10px 25px rgba(0,0,0,0.4)"
          }}
        >

          <p><b>Date:</b> {new Date(h.updatedAt).toLocaleString()}</p>

          <p><b>Old Description:</b> {h.oldData?.description}</p>

          <p><b>Old Closed By:</b> {h.oldData?.closedBy}</p>

        </div>

      ))}

    </div>

  );

}

export default UnsafeClosed;