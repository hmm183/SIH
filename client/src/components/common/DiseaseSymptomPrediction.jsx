import React, { useState, useMemo } from 'react';

// The entire CSS stylesheet is placed in this template literal
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500&display=swap');

  :root {
    --bg-color: #0d1117;
    --primary-color: #00f6ff;
    --secondary-color: #ff00c1;
    --border-color: #30363d;
    --text-color: #c9d1d9;
    --text-muted: #8b949e;
    --card-bg: #161b22;
    --font-family: 'Roboto Mono', monospace;
  }

  /* Scoping styles to the component's main container to avoid global conflicts */
  .disease-predictor-container {
    font-family: var(--font-family);
    max-width: 1200px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: var(--text-color);
  }

  .disease-predictor-container .app-header {
    text-align: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
  }

  .disease-predictor-container .app-header h1 {
    font-size: 2.5rem;
    font-weight: 500;
    color: var(--primary-color);
    text-shadow: 0 0 10px var(--primary-color);
    margin-bottom: 0.5rem;
  }

  .disease-predictor-container .app-header p {
    color: var(--text-muted);
    font-size: 1rem;
  }

  .disease-predictor-container .main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    min-height: 50vh;
  }

  .disease-predictor-container .symptoms-panel, .disease-predictor-container .selection-panel {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  }

  .disease-predictor-container .search-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
  }

  .disease-predictor-container .search-bar svg {
    color: var(--text-muted);
  }

  .disease-predictor-container .search-bar input {
    width: 100%;
    background: none;
    border: none;
    outline: none;
    color: var(--text-color);
    font-family: var(--font-family);
    font-size: 1rem;
  }

  .disease-predictor-container .symptoms-list {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-content: flex-start;
    padding-right: 10px; /* For scrollbar gap */
  }

  /* Custom Scrollbar */
  .disease-predictor-container .symptoms-list::-webkit-scrollbar {
    width: 8px;
  }
  .disease-predictor-container .symptoms-list::-webkit-scrollbar-track {
    background: var(--bg-color);
  }
  .disease-predictor-container .symptoms-list::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 20px;
  }
  .disease-predictor-container .symptoms-list::-webkit-scrollbar-thumb:hover {
    background-color: var(--primary-color);
  }

  .disease-predictor-container .symptom-tag {
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-transform: capitalize;
    font-family: inherit;
  }

  .disease-predictor-container .symptom-tag:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
  }

  .disease-predictor-container .symptom-tag.selected {
    background-color: var(--primary-color);
    color: var(--bg-color);
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(0, 246, 255, 0.5);
  }

  .disease-predictor-container .selection-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
  }

  .disease-predictor-container .selection-panel h2 {
    margin: 0;
    color: var(--secondary-color);
    text-shadow: 0 0 8px var(--secondary-color);
  }
  
  .disease-predictor-container .clear-all-button {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
  }
  .disease-predictor-container .clear-all-button:hover {
      border-color: var(--secondary-color);
      color: var(--secondary-color);
  }

  .disease-predictor-container .selected-symptoms-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    flex-grow: 1;
  }

  .disease-predictor-container .selected-tag {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-color);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border-left: 3px solid var(--secondary-color);
    text-transform: capitalize;
  }

  .disease-predictor-container .selected-tag button {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0 0.5rem;
  }
  .disease-predictor-container .selected-tag button:hover {
    color: var(--secondary-color);
  }

  .disease-predictor-container .placeholder-text {
    color: var(--text-muted);
    text-align: center;
    margin-top: 2rem;
  }

  .disease-predictor-container .actions-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .disease-predictor-container .predict-button {
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 1rem 3rem;
    font-size: 1.2rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    position: relative;
    overflow: hidden;
    min-width: 250px;
    min-height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .disease-predictor-container .predict-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0 25px var(--primary-color), 0 0 25px var(--secondary-color);
  }

  .disease-predictor-container .predict-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Loader animation */
  .disease-predictor-container .loader {
    width: 24px;
    height: 24px;
    border: 3px solid #FFF;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
  @keyframes rotation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .disease-predictor-container .error-message {
    color: #ff4d4d;
    background-color: rgba(255, 77, 77, 0.1);
    border: 1px solid #ff4d4d;
    padding: 1rem;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
  }
  
  .disease-predictor-container .results-area {
      display: flex;
      justify-content: center;
      width: 100%;
  }

  .disease-predictor-container .result-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 600px;
    text-align: center;
    animation: fadeIn 0.5s ease-out;
    border-top: 3px solid var(--primary-color);
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .disease-predictor-container .result-card svg {
      color: var(--primary-color);
      flex-shrink: 0;
  }

  .disease-predictor-container .result-content {
      text-align: left;
  }

  .disease-predictor-container .result-content h3 {
    margin: 0 0 0.5rem 0;
    color: var(--primary-color);
    font-size: 1.2rem;
  }

  .disease-predictor-container .result-content p {
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    color: #fff;
    text-transform: capitalize;
  }
  .disease-predictor-container .result-content span {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 1rem;
      display: block;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Responsive Design */
  @media (max-width: 900px) {
    .disease-predictor-container .main-content {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
      .disease-predictor-container {
          padding: 1rem;
          margin: 1rem auto;
      }
      .disease-predictor-container .app-header h1 {
          font-size: 2rem;
      }
  }
`;

// SVG Icons for a polished look
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const StethoscopeIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16.5 13.125V6.375C16.5 4.347 14.903 2.75 13 2.75h-2c-1.903 0-3.5 1.597-3.5 3.625v6.75M9.5 13.125c0 .98-.625 1.75-1.5 1.75s-1.5-.77-1.5-1.75v-2.5c0-.98.625-1.75 1.5-1.75s1.5.77 1.5 1.75v2.5z"></path><path d="M14.5 13.125c0 .98.625 1.75 1.5 1.75s1.5-.77 1.5-1.75v-2.5c0-.98-.625-1.75-1.5-1.75s-1.5.77-1.5 1.75v2.5z"></path><path d="M5 13.5v5.5a2 2 0 002 2h10a2 2 0 002-2v-5.5"></path><circle cx="12" cy="19" r="4"></circle></svg>;

const ALL_SYMPTOMS = ["itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting", "vomiting", "burning_micturition", "spotting_ urination", "fatigue", "weight_gain", "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss", "restlessness", "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", "high_fever", "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion", "headache", "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain", "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine", "yellowing_of_eyes", "acute_liver_failure", "fluid_overload", "swelling_of_stomach", "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision", "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose", "congestion", "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness", "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels", "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "excessive_hunger", "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech", "knee_pain", "hip_joint_pain", "muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness", "spinning_movements", "loss_of_balance", "unsteadiness", "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort", "foul_smell_of urine", "continuous_feel_of_urine", "passage_of_gases", "internal_itching", "toxic_look_(typhos)", "depression", "irritability", "muscle_pain", "altered_sensorium", "red_spots_over_body", "belly_pain", "abnormal_menstruation", "dischromic _patches", "watering_from_eyes", "increased_appetite", "polyuria", "family_history", "mucoid_sputum", "rusty_sputum", "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion", "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen", "history_of_alcohol_consumption", "fluid_overload.1", "blood_in_sputum", "prominent_veins_on_calf", "palpitations", "painful_walking", "pus_filled_pimples", "blackheads", "scurring", "skin_peeling", "silver_like_ dusting", "small_dents_in_nails", "inflammatory_nails", "blister", "red_sore_around_nose", "yellow_crust_ooze"];

function DiseaseSymptomPrediction() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symptom)) {
        newSet.delete(symptom);
      } else {
        newSet.add(symptom);
      }
      return newSet;
    });
  };

  const handleClearAll = () => {
    setSelectedSymptoms(new Set());
  };

  const handlePredict = async () => {
    if (selectedSymptoms.size === 0) {
      setError("Please select at least one symptom.");
      return;
    }
    setIsLoading(true);
    setError('');
    setPrediction(null);

    const postUrl = 'https://raushan2709-disease-prediction-workers.hf.space/gradio_api/call/predict';
    const getUrlBase = 'https://raushan2709-disease-prediction-workers.hf.space/gradio_api/call/predict/';

    try {
        const postResponse = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [Array.from(selectedSymptoms)] }),
        });

        if (!postResponse.ok) throw new Error(`API Error (POST): ${postResponse.status} ${postResponse.statusText}`);
        
        const eventData = await postResponse.json();
        const eventId = eventData.event_id;
        if (!eventId) throw new Error("API did not return a valid event_id.");

        const getResponse = await fetch(`${getUrlBase}${eventId}`);
        if (!getResponse.ok) throw new Error(`API Error (GET): ${getResponse.status} ${getResponse.statusText}`);

        const reader = getResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let predictionFound = false;

        const processLine = (line) => {
            if (line.startsWith('data:')) {
                try {
                    const eventJson = JSON.parse(line.substring(5));
                    if (Array.isArray(eventJson) && eventJson.length > 0) {
                        setPrediction(eventJson[0]);
                        predictionFound = true;
                    } else if (eventJson.msg === 'process_completed') {
                        if (eventJson.success) {
                            setPrediction(eventJson.output.data[0]);
                            predictionFound = true;
                        } else {
                            setError("Prediction failed according to API.");
                        }
                    }
                } catch (e) {
                    console.warn("Could not parse a line of the stream:", line, e);
                }
            }
        };

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                processLine(line);
                if (predictionFound) break;
            }
            if (predictionFound) break;
        }

        if (!predictionFound && buffer) {
            processLine(buffer);
        }
        
        if (!predictionFound) {
             setError("Prediction result not found in API response stream.");
        }

    } catch (e) {
        setError(e.message);
        console.error('API call failed:', e);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredSymptoms = useMemo(() =>
    ALL_SYMPTOMS.filter(symptom =>
      symptom.replace(/_/g, ' ').toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]
  );

  return (
    <>
      <style>{styles}</style>
      <div className="disease-predictor-container">
        <header className="app-header">
          <h1>Bio-Synth Diagnosis AI</h1>
          <p>Select your symptoms and let our AI provide a potential diagnosis.</p>
        </header>

        <main className="main-content">
          <div className="symptoms-panel">
            <div className="search-bar">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search for symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="symptoms-list">
              {filteredSymptoms.map(symptom => (
                <button
                  key={symptom}
                  className={`symptom-tag ${selectedSymptoms.has(symptom) ? 'selected' : ''}`}
                  onClick={() => handleSymptomToggle(symptom)}
                >
                  {symptom.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="selection-panel">
            <div className="selection-panel-header">
                <h2>Selected ({selectedSymptoms.size})</h2>
                {selectedSymptoms.size > 0 && 
                    <button className="clear-all-button" onClick={handleClearAll}>Clear All</button>
                }
            </div>
            <div className="selected-symptoms-list">
              {selectedSymptoms.size > 0 ? (
                Array.from(selectedSymptoms).map(symptom => (
                  <div key={symptom} className="selected-tag">
                    <span>{symptom.replace(/_/g, ' ')}</span>
                    <button onClick={() => handleSymptomToggle(symptom)}>×</button>
                  </div>
                ))
              ) : (
                <p className="placeholder-text">Your chosen symptoms will appear here.</p>
              )}
            </div>
          </div>
        </main>
        
        <footer className="actions-footer">
          <button
            className="predict-button"
            onClick={handlePredict}
            disabled={isLoading || selectedSymptoms.size === 0}
          >
            {isLoading ? (
              <div className="loader"></div>
            ) : (
              'Initiate Diagnosis'
            )}
          </button>
          <div className="results-area">
            {error && <p className="error-message">{error}</p>}
            {prediction && !isLoading && (
              <div className="result-card">
                  <StethoscopeIcon />
                  <div className='result-content'>
                      <h3>Potential Diagnosis</h3>
                      <p>{prediction}</p>
                      <span>Disclaimer: This is an AI prediction. Always consult a medical professional.</span>
                  </div>
              </div>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}

export default DiseaseSymptomPrediction;

