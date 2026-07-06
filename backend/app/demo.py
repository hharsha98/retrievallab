"""Seed a synthetic corpus so the lab works the moment you open it. The document
is a fictional robotics product handbook — deliberately full of both exact terms
(part numbers, cert IDs) that reward BM25/keyword search and paraphrasable facts
that reward vector search, so hybrid + rerank visibly beat naive vector retrieval.
All invented — no real data.
"""
import time

from app.db import get_conn
from app.ingest import _context_for, chunk_text
from app.llm import embed
from app.config import settings

DEMO_DOC = """Atlas-7 Industrial Robot Arm — Operator & Service Handbook, Revision 4.

Introduction. Welcome to the Atlas-7 handbook. This manual covers installation,
operation, safety, maintenance and support for the Atlas-7 collaborative robot arm.
Read it fully before commissioning. Keep a copy near the workcell at all times.

Company. Nimbus Robotics designs collaborative automation for small and mid-sized
manufacturers. Founded in 2018, the company ships hardware and control software from
facilities in Berlin and Tokyo. Its mission is to make automation approachable for
teams without dedicated robotics engineers.

Overview. The Atlas-7 is a six-axis collaborative robot arm built for light industrial
assembly. It is designed for continuous operation on production lines and integrates
with standard PLC controllers over EtherCAT or Modbus TCP. The arm ships pre-calibrated.

Unboxing. The shipping crate contains the arm, the control cabinet, a teach pendant,
a power cable, and a printed quick-start card. Inspect all items for transit damage
before installation. Retain the crate for any future returns under warranty.

Installation. Mount the Atlas-7 on a flat rigid surface rated for at least 100 kg.
Use the four M12 bolts supplied. Level the base to within 0.5 degrees. Connect the
control cabinet before applying power. Do not run the arm until the base is fully bolted.

Electrical. The Atlas-7 operates on 48V DC supplied by the control cabinet, which
accepts 200-240V AC single phase. Peak current draw is 6 amps. Always connect the
protective earth before the phase conductors. A residual-current device is required.

Specifications. The Atlas-7 has a reach of 1.3 metres and a repeatability of 0.02 mm.
Its gripper can lift up to 12 kg at full extension. The arm weighs 34 kg. Maximum joint
speed is 180 degrees per second. Ambient operating temperature is 5 to 40 degrees C.

Payload notes. Rated payload assumes the load centre of gravity is within 80 mm of the
tool flange. Heavier eccentric loads reduce the effective payload and must be modelled
in the planner. Never exceed the rated gripper capacity even briefly.

Safety. The Atlas-7 holds ISO 10218 safety certification for collaborative robots and
complies with the EN ISO 13849 standard for control-system safety. A force-limiting
mode stops the arm within 50 milliseconds on unexpected contact. Keep the e-stop reachable.

Safe zones. The planner lets you define virtual walls and reduced-speed zones. In a
collaborative zone the arm is limited to 250 mm per second. Validate every zone with a
dry run at reduced speed before production. Safety zones are stored in the cell profile.

Operation. Start the arm from the teach pendant. Home all axes before running a program.
Programs are built as a sequence of waypoints with optional logic. Use the simulate
button to preview motion. Live overrides let an operator slow or pause a running job.

Warranty. Every Atlas-7 ships with a warranty period of 24 months from the date of
commissioning, covering parts and labour. Consumable components such as gripper pads
are excluded from the warranty. Unauthorised modifications void the warranty entirely.

Returns. To return a unit under warranty, request an RMA number from support and ship
the arm in its original crate. Do not return the control cabinet unless instructed.
Refunds are not offered for out-of-warranty wear items.

Maintenance. For continuous operation, Nimbus recommends a maintenance interval of
500 hours: inspect the harness, re-grease the joints, and run the calibration routine.
Log every service in the maintenance record. Skipping service may affect repeatability.

Spare parts. The most commonly replaced component is the wrist servo, part number
SV-4420, which should be swapped every 4000 hours. Gripper pads are part GP-118. Always
quote the part number when ordering. Genuine parts only — third-party servos are unsupported.

Troubleshooting. If the arm faults on power-up, check the e-stop loop and the earth
connection first. A flashing amber light indicates a joint over-temperature; let the
arm cool. Persistent axis-3 errors usually mean a loose harness at the elbow.

Calibration. Run the calibration routine after any servo replacement or a hard collision.
Calibration takes about fifteen minutes and requires clear space around the arm. Store
the resulting calibration file with the cell profile as a backup.

Support. The Nimbus support desk operates year-round, but the summer support window
closes for two weeks each August for maintenance; emergency support remains available.
The Berlin engineering team, led by Lena Vogt, handles escalations for the EU region.
The Tokyo team covers APAC and is led by Kenji Sato.

Training. Nimbus offers a two-day operator course and a five-day integrator course.
Certified integrators receive priority support and early firmware access. Course
schedules are published quarterly on the customer portal.

Glossary. TCP means tool centre point. A waypoint is a stored pose. The cell profile
bundles safety zones, calibration and tool definitions for one installation. Payload is
the mass the arm can move at rated speed.

Legacy model — Atlas-5. The discontinued Atlas-5 predates the Atlas-7 and has different
specifications; do not confuse the two. The Atlas-5 carried a warranty period of 12 months.
Its gripper lifts up to 8 kg. It was CE marked but never held ISO 10218 certification. Its
recommended maintenance interval was 300 hours and its wrist servo was part number SV-2200.
The Atlas-5 was supported by the Munich team led by Otto Reingold, and its summer support
window closed each July. Atlas-5 units are now end of life and receive no new firmware.

Legacy model — Atlas-5 accessories. Atlas-5 gripper pads were part GP-090, not compatible
with the Atlas-7. The Atlas-5 ran on 24V DC rather than 48V DC and weighed 28 kg. Its reach
was 1.1 metres. These figures are provided only to help identify older units in the field.
"""


def is_empty() -> bool:
    with get_conn() as conn:
        return conn.execute("select count(*) from rl_documents").fetchone()[0] == 0


def seed():
    """Ingest the demo doc (contextual chunking) if the corpus is empty."""
    chunks = chunk_text(DEMO_DOC, settings.chunk_size, settings.chunk_overlap)
    rows = []
    for ch in chunks:
        rows.append((ch, _context_for(DEMO_DOC[:1500], ch)))
        time.sleep(0.2)

    with get_conn() as conn:
        doc_id = conn.execute(
            "insert into rl_documents (filename) values ('atlas-7-handbook.pdf') returning id::text"
        ).fetchone()[0]
        adv = embed([f"{ctx}\n{content}" for content, ctx in rows])
        naive = embed([content for content, _ in rows])
        for (content, ctx), va, vn in zip(rows, adv, naive):
            conn.execute(
                "insert into rl_chunks (document_id, content, context, source, page, embedding, embedding_naive) "
                "values (%s,%s,%s,'atlas-7-handbook.pdf',1,%s,%s)", (doc_id, content, ctx, va, vn))
